<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Card Payment — {{ $merchant->name }}</title>
    @vite('resources/css/app.css')
    <script
        src="{{ $checkoutJsUrl }}"
        data-error="errorCallback"
        data-cancel="{{ $cancelUrl }}"
    ></script>
</head>
<body class="min-h-screen bg-brand-light text-brand-dark flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl border border-brand-border p-6 md:p-10 shadow-xs max-w-md w-full text-center">
        <!-- Merchant Branding Header -->
        <div class="flex items-center justify-center gap-2.5 mb-5">
            @if($merchant->logo_url)
                <img src="{{ $merchant->logo_url }}" alt="{{ $merchant->name }}" class="h-8 max-w-[120px] object-contain">
            @else
                <div class="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary font-bold text-xs flex items-center justify-center">
                    {{ substr($merchant->name, 0, 2) }}
                </div>
                <span class="font-extrabold text-brand-dark text-sm">{{ $merchant->name }}</span>
            @endif
        </div>

        <h1 class="text-xl font-bold text-brand-dark mb-1">Mastercard Secure Checkout</h1>
        <p class="text-xs text-gray-500 mb-1">Ref: <strong class="text-brand-dark">{{ $session->merchant_reference }}</strong></p>
        <p class="text-2xl font-black text-brand-primary mb-4">{{ $session->currency }} {{ number_format($session->amount, 0) }}</p>

        <p id="statusText" class="text-xs text-gray-400">Connecting to Mastercard Gateway, please wait...</p>

        <div id="errorBox" class="hidden mt-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 text-left"></div>

        <div id="errorActions" class="hidden mt-5">
            <button
                type="button"
                onclick="launchCheckout()"
                class="w-full bg-brand-dark text-white py-3.5 rounded-xl font-bold text-sm hover:bg-black transition cursor-pointer"
            >
                Try Again
            </button>

            <a
                href="{{ $cancelUrl }}"
                class="mt-3.5 inline-block text-xs text-gray-500 hover:text-brand-primary font-medium underline"
            >
                Cancel and return
            </a>
        </div>
    </div>

    <script>
        function errorCallback(error) {
            console.error('MPGS Checkout Error:', error);
            document.getElementById('statusText').classList.add('hidden');
            document.getElementById('errorActions').classList.remove('hidden');
            var box = document.getElementById('errorBox');
            box.classList.remove('hidden');
            box.textContent = (error && error.explanation)
                ? error.explanation
                : 'Unable to open Mastercard Secure Checkout. Please try again.';
        }

        function launchCheckout() {
            if (typeof Checkout === 'undefined') {
                errorCallback({ explanation: 'Payment script failed to load. Check your connection and retry.' });
                return;
            }
            Checkout.configure({
                session: {
                    id: @json($sessionId)
                }
            });
            Checkout.showPaymentPage();
        }

        window.addEventListener('load', launchCheckout);
    </script>
</body>
</html>