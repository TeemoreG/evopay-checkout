<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MpgsService
{
    protected string $gatewayUrl;
    protected string $merchantId;
    protected string $apiPassword;
    protected string $apiVersion;
    protected string $operation;

    public function __construct()
    {
        $this->gatewayUrl = rtrim(env('MPGS_GATEWAY_URL', 'https://ap-gateway.mastercard.com'), '/');
        $this->merchantId = env('MPGS_MERCHANT_ID', 'EVOPAYLTD');
        $this->apiPassword = env('MPGS_API_PASSWORD', '');
        $this->apiVersion = env('MPGS_API_VERSION', '100');
        $this->operation = env('MPGS_OPERATION', 'PURCHASE');
    }

    public function createSession($amount, $orderId, $currency = 'KES', ?string $returnUrl = null, ?string $cancelUrl = null): array
    {
        $url = "{$this->gatewayUrl}/api/rest/version/{$this->apiVersion}/merchant/{$this->merchantId}/session";

        $interaction = [
            'operation' => $this->operation,
            'merchant' => [
                'name' => 'Evopay Shop',
            ],
        ];

        if ($returnUrl) {
            $interaction['returnUrl'] = $returnUrl;
        }

        if ($cancelUrl) {
            $interaction['cancelUrl'] = $cancelUrl;
        }

        $payload = [
            'apiOperation' => 'INITIATE_CHECKOUT',
            'interaction' => $interaction,
            'order' => [
                'currency' => $currency,
                'amount' => number_format((float) $amount, 2, '.', ''),
                'id' => (string) $orderId,
                'description' => "Payment for Order {$orderId}",
            ],
        ];

        $response = Http::withBasicAuth('merchant.' . $this->merchantId, $this->apiPassword)
            ->post($url, $payload);

        if ($response->failed()) {
            Log::error('MPGS Session Error: ' . $response->body());
            throw new \Exception('MPGS Session Failed: ' . $response->body());
        }

        return $response->json();
    }

    public function retrieveOrder(string $orderId): array
    {
        $url = "{$this->gatewayUrl}/api/rest/version/{$this->apiVersion}/merchant/{$this->merchantId}/order/{$orderId}";

        $response = Http::withBasicAuth('merchant.' . $this->merchantId, $this->apiPassword)
            ->get($url);

        if ($response->failed()) {
            Log::error('MPGS Retrieve Order Error: ' . $response->body());
            throw new \Exception('MPGS Order Verification Failed: ' . $response->body());
        }

        return $response->json();
    }

    public function getCheckoutJsUrl(): string
    {
        return "{$this->gatewayUrl}/static/checkout/checkout.min.js";
    }
}