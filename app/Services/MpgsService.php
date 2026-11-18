<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class MpgsService
{
    public function createSession($amount, $orderId, $currency = 'KES')
    {
        // Replace these with your actual Evopay MPGS credentials from .env
        $merchantId = env('MPGS_MERCHANT_ID', 'EVOPAYLTD'); 
        $apiPassword = env('MPGS_API_PASSWORD', 'your_api_password');
        $apiVersion = '100';
        
        $url = "https://ap-gateway.mastercard.com/api/rest/version/{$apiVersion}/merchant/{$merchantId}/session";

        $payload = [
            "apiOperation" => "INITIATE_CHECKOUT",
            "interaction" => [
                "operation" => "AUTHORIZE",
                "merchant" => [
                    "name" => "Evopay Shop"
                ]
            ],
            "order" => [
                "currency" => $currency,
                "amount" => number_format($amount, 2, '.', ''),
                "id" => (string) $orderId,
                "description" => "Payment for Order {$orderId}"
            ]
        ];

        //Basic Auth (merchantId : apiPassword)
        $response = Http::withBasicAuth('merchant.' . $merchantId, $apiPassword)
            ->post($url, $payload);

        if ($response->failed()) {
            throw new \Exception('MPGS Session Failed: ' . $response->body());
        }

        return $response->json();
    }
}