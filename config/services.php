<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'mpesa' => [
        'consumer_key' => env('MPESA_CONSUMER_KEY'),
        'consumer_secret' => env('MPESA_CONSUMER_SECRET'),
        'shortcode' => env('MPESA_SHORTCODE'),
        'passkey' => env('MPESA_PASSKEY'),
        'callback_url' => env('MPESA_CALLBACK_URL'),
        'env' => env('MPESA_ENV', 'sandbox'),
    ],

    'mpgs' => [
        'gateway_url' => env('MPGS_GATEWAY_URL', 'https://ap-gateway.mastercard.com'),
        'merchant_id' => env('MPGS_MERCHANT_ID', 'EVOPAYLTD'),
        'api_password' => env('MPGS_API_PASSWORD', ''),
        'api_version' => env('MPGS_API_VERSION', '100'),
        'operation' => env('MPGS_OPERATION', 'PURCHASE'),
        'webhook_secret' => env('MPGS_WEBHOOK_SECRET'),
    ],

    'evopay_shop' => [
        'gateway_url' => env('EVOPAY_GATEWAY_URL'),
        'secret_key' => env('EVOPAY_SHOP_SECRET_KEY'),
        'webhook_secret' => env('EVOPAY_SHOP_WEBHOOK_SECRET'),
    ],

    'google_maps' => [
        'api_key' => env('GOOGLE_MAPS_API_KEY'),
    ],

];