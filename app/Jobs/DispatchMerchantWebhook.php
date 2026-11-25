<?php

namespace App\Jobs;

use App\Models\CheckoutSession;
use App\Models\WebhookDelivery;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DispatchMerchantWebhook implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public array $backoff = [15, 60, 300]; // Retry after 15s, 1m, 5m

    public CheckoutSession $session;
    public string $event;

    public function __construct(CheckoutSession $session, string $event = 'payment.succeeded')
    {
        $this->session = $session;
        $this->event = $event;
    }

    public function handle(): void
    {
        $session = $this->session->fresh(['merchant']) ?? $this->session->loadMissing('merchant');
        $merchant = $session->merchant;

        // Use session-specific webhook_url, or fallback to merchant default
        $targetUrl = $session->webhook_url ?: $merchant?->webhook_url;

        if (!$merchant || !$targetUrl) {
            Log::info("Webhook skipped for Session {$session->token}: No webhook URL configured.");
            return;
        }

        $payload = [
            'event' => $this->event,
            'created_at' => now()->toIso8601String(),
            'data' => [
                'token' => $session->token,
                'merchant_reference' => $session->merchant_reference,
                'amount' => (float) $session->amount,
                'currency' => $session->currency,
                'status' => $session->status,
                'payment_method' => $session->payment_method,
                'mpesa_receipt' => $session->mpesa_receipt,
                'failure_reason' => $session->failure_reason,
                'customer' => $session->customer ?? [],
                'metadata' => $session->metadata ?? [],
                'paid_at' => $session->paid_at?->toIso8601String(),
            ],
        ];

        $encodedPayload = json_encode($payload, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES);
        $secret = $merchant->webhook_secret ?: 'whsec_default';
        $signature = 'sha256=' . hash_hmac('sha256', $encodedPayload, $secret);

        $delivery = WebhookDelivery::create([
            'merchant_id' => $merchant->id,
            'checkout_session_id' => $session->id,
            'event' => $this->event,
            'url' => $targetUrl,
            'payload' => $payload,
            'attempts' => $this->attempts(),
        ]);

        try {
            $response = Http::timeout(10)
                ->withHeaders([
                    'Accept' => 'application/json',
                    'User-Agent' => 'Evopay-Webhook/1.0',
                    'X-Evopay-Signature' => $signature,
                    'X-Evopay-Event' => $this->event,
                ])
                ->withBody($encodedPayload, 'application/json')
                ->post($targetUrl);

            $statusCode = $response->status();
            $body = mb_substr($response->body(), 0, 1000);

            $delivery->update([
                'response_code' => $statusCode,
                'response_body' => $body,
                'delivered_at' => $response->successful() ? now() : null,
                'error' => $response->successful() ? null : "HTTP Error {$statusCode}",
            ]);

            if (!$response->successful()) {
                throw new \Exception("Webhook returned HTTP {$statusCode}: {$body}");
            }

            Log::info("Webhook {$this->event} delivered to {$targetUrl} (Status: {$statusCode})");
        } catch (\Throwable $e) {
            $delivery->update([
                'error' => $e->getMessage(),
            ]);

            Log::warning("Webhook delivery failed for Session {$session->token} to {$targetUrl}: {$e->getMessage()}");

            if ($this->attempts() < $this->tries) {
                $this->release($this->backoff[$this->attempts() - 1] ?? 60);
            } else {
                $this->fail($e);
            }
        }
    }
}