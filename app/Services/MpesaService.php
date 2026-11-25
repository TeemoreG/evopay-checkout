<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MpesaService
{
    protected $consumerKey;
    protected $consumerSecret;
    protected $shortcode;
    protected $passkey;
    protected $callbackUrl;
    protected $env;

    public function __construct()
    {
        $this->consumerKey = config('services.mpesa.consumer_key');
        $this->consumerSecret = config('services.mpesa.consumer_secret');
        $this->shortcode = config('services.mpesa.shortcode');
        $this->passkey = config('services.mpesa.passkey');
        $this->callbackUrl = config('services.mpesa.callback_url');
        $this->env = config('services.mpesa.env', 'sandbox');
    }

    public function getAccessToken()
    {
        $url = $this->env === 'production'
            ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
            : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

        $response = Http::withBasicAuth($this->consumerKey, $this->consumerSecret)->get($url);

        if ($response->successful()) {
            return $response->json()['access_token'];
        }

        Log::error('M-Pesa Token Error: ' . $response->body());
        throw new \Exception('Failed to get M-Pesa access token');
    }

    public function stkPush($phone, $amount, $orderId)
    {
        $token = $this->getAccessToken();
        $timestamp = now()->format('YmdHis');
        $password = base64_encode($this->shortcode . $this->passkey . $timestamp);

        $phone = preg_replace('/\D/', '', (string) $phone);
        if (str_starts_with($phone, '0')) {
            $phone = '254' . substr($phone, 1);
        }

        $url = $this->env === 'production'
            ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
            : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

        $payload = [
            'BusinessShortCode' => $this->shortcode,
            'Password' => $password,
            'Timestamp' => $timestamp,
            'TransactionType' => 'CustomerPayBillOnline',
            'Amount' => (int) round((float) $amount),
            'PartyA' => $phone,
            'PartyB' => $this->shortcode,
            'PhoneNumber' => $phone,
            'CallBackURL' => $this->callbackUrl,
            'AccountReference' => $orderId,
            'TransactionDesc' => 'Payment for order ' . $orderId,
        ];

        $response = Http::withToken($token)->post($url, $payload);

        if ($response->successful()) {
            return $response->json();
        }

        Log::error('M-Pesa STK Push Error: ' . $response->body());
        throw new \Exception('STK Push failed: ' . ($response->json()['errorMessage'] ?? 'Unknown error'));
    }

    /**
     * Query Safaricom Daraja directly for the status of an STK Push.
     * Returns ['state' => 'paid'|'failed'|'pending', 'result_code' => int|null, 'result_desc' => string|null].
     */
    public function stkQuery(string $checkoutRequestId): array
    {
        $token = $this->getAccessToken();
        $timestamp = now()->format('YmdHis');
        $password = base64_encode($this->shortcode . $this->passkey . $timestamp);

        $url = $this->env === 'production'
            ? 'https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query'
            : 'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query';

        $payload = [
            'BusinessShortCode' => $this->shortcode,
            'Password' => $password,
            'Timestamp' => $timestamp,
            'CheckoutRequestID' => $checkoutRequestId,
        ];

        $response = Http::withToken($token)->timeout(10)->post($url, $payload);
        $data = $response->json() ?? [];

        // Daraja returns 500.001.1001 while the user has not yet completed the PIN prompt
        if (($data['errorCode'] ?? null) === '500.001.1001') {
            return [
                'state' => 'pending',
                'result_code' => null,
                'result_desc' => $data['errorMessage'] ?? 'Transaction is still being processed.',
            ];
        }

        if ($response->successful() && isset($data['ResultCode'])) {
            $resultCode = (int) $data['ResultCode'];

            return [
                'state' => $resultCode === 0 ? 'paid' : 'failed',
                'result_code' => $resultCode,
                'result_desc' => $data['ResultDesc'] ?? null,
            ];
        }

        Log::warning('M-Pesa STK Query Unexpected Response: ' . $response->body());

        return [
            'state' => 'pending',
            'result_code' => null,
            'result_desc' => null,
        ];
    }
}