<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redirecting to Card Payment — Evopay</title>
    @vite('resources/css/app.css')
    <script
        src="{{ $checkoutJsUrl }}"
        data-error="errorCallback"
        data-cancel="{{ $cancelUrl }}"
    ></script>
</head>
<body class="min-h-screen bg-brand-light text-brand-dark flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl border border-brand-border p-6 md:p-8 shadow-sm max-w-md w-full text-center">
        <div id="spinner" class="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>

        <h1 class="text-xl font-bold text-brand-dark mb-2">Redirecting to Card Payment</h1>
        <p class="text-sm text-gray-500 mb-6">
            Order <strong class="text-brand-dark">{{ $order->order_number }}</strong> ·
            <span class="font-semibold text-brand-primary">KSh {{ number_format($order->total_amount, 0) }}</span>
        </p>

        <div id="errorBox" class="hidden mb-5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700 text-left"></div>

        <button
            type="button"
            onclick="launchCheckout()"
            class="w-full bg-brand-dark text-white py-4 rounded-xl font-bold text-sm hover:bg-black transition cursor-pointer"
        >
            Continue to Secure Checkout
        </button>

        <a
            href="{{ $cancelUrl }}"
            class="mt-4 inline-block text-sm text-gray-500 hover:text-brand-primary font-medium underline"
        >
            Cancel and return to checkout
        </a>
    </div>

    <script>
        function errorCallback(error) {
            console.error('MPGS Checkout Error:', error);
            document.getElementById('spinner').classList.add('hidden');
            var box = document.getElementById('errorBox');
            box.classList.remove('hidden');
            box.textContent = (error && error.explanation)
                ? error.explanation
                : 'Unable to open Mastercard Secure Checkout. Please try again.';
        }

        function launchCheckout() {
            if (typeof Checkout === 'undefined') {
                errorCallback({ explanation: 'Payment gateway script failed to load. Check your connection and retry.' });
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