<?php

namespace App\Http\Middleware;

use App\Models\ApiKey;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateApiKey
{
    public function handle(Request $request, Closure $next): Response
    {
        $header = $request->header('Authorization');

        if (!$header || !str_starts_with($header, 'Bearer ')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Missing or malformed Authorization header. Expected: Bearer sk_live_...',
            ], 401);
        }

        $plainTextKey = trim(substr($header, 7));
        $apiKey = ApiKey::verifySecretKey($plainTextKey);

        if (!$apiKey) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid or inactive API key.',
            ], 401);
        }

        // Attach merchant and apiKey to the request
        $request->attributes->set('merchant', $apiKey->merchant);
        $request->attributes->set('api_key', $apiKey);

        return $next($request);
    }
}