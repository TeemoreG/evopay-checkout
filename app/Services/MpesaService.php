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
        $this->consumerKey = env('MPESA_CONSUMER_KEY');
        $this->consumerSecret = env('MPESA_CONSUMER_SECRET');
        $this->shortcode = env('MPESA_SHORTCODE');
        $this->passkey = env('MPESA_PASSKEY');
        $this->callbackUrl = env('MPESA_CALLBACK_URL');
        $this->env = env('MPESA_ENV', 'sandbox');
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
        
        // Format phone to 2547XXXXXXXX
        $phone = preg_replace('/^0/', '254', $phone);
        $phone = preg_replace('/^\+/', '', $phone);

        $url = $this->env === 'production' 
            ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
            : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

        $payload = [
            'BusinessShortCode' => $this->shortcode,
            'Password' => $password,
            'Timestamp' => $timestamp,
            'TransactionType' => 'CustomerPayBillOnline',
            'Amount' => round($amount), // Amount must be an integer
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
}