<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Payment Receipt — {{ $order->order_number }}</title>
</head>
<body style="font-family: Arial, sans-serif; background: #f9fafb; color: #1a1a1a; margin: 0; padding: 24px;">
    <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 28px;">
        <h2 style="margin: 0 0 6px; color: #1a1a1a;">Payment Confirmed</h2>
        <p style="margin: 0 0 20px; color: #6b7280; font-size: 14px;">
            Thank you, {{ $order->customer['name'] ?? 'Customer' }}. Your order has been received.
        </p>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
            <tr>
                <td style="padding: 6px 0; color: #6b7280;">Order Number</td>
                <td style="padding: 6px 0; text-align: right; font-weight: bold;">{{ $order->order_number }}</td>
            </tr>
            <tr>
                <td style="padding: 6px 0; color: #6b7280;">Payment Method</td>
                <td style="padding: 6px 0; text-align: right; font-weight: bold; text-transform: uppercase;">{{ $order->payment_method }}</td>
            </tr>
            @if($order->mpesa_receipt)
            <tr>
                <td style="padding: 6px 0; color: #6b7280;">M-Pesa Receipt</td>
                <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #16a34a;">{{ $order->mpesa_receipt }}</td>
            </tr>
            @endif
            <tr>
                <td style="padding: 6px 0; color: #6b7280;">Delivery</td>
                <td style="padding: 6px 0; text-align: right;">
                    {{ ($order->delivery['method'] ?? 'standard') === 'pickup' ? 'Store Pickup (Free)' : ($order->delivery['formatted'] ?? 'Standard Delivery') }}
                </td>
            </tr>
        </table>

        <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; margin-bottom: 16px;">
            <p style="margin: 0 0 10px; font-weight: bold; font-size: 13px;">Items</p>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                @foreach(($order->items ?? []) as $item)
                <tr>
                    <td style="padding: 5px 0;">
                        {{ $item['qty'] ?? 1 }} × {{ $item['productName'] ?? 'Item' }}
                        @if(!empty($item['unitLabel']))
                            <span style="color: #6b7280;">({{ $item['unitLabel'] }})</span>
                        @endif
                    </td>
                    <td style="padding: 5px 0; text-align: right;">
                        KSh {{ number_format((float) ($item['lineTotal'] ?? 0), 0) }}
                    </td>
                </tr>
                @endforeach
                @if(($order->delivery['fee'] ?? 0) > 0)
                <tr>
                    <td style="padding: 5px 0; color: #6b7280;">Delivery Fee</td>
                    <td style="padding: 5px 0; text-align: right;">
                        KSh {{ number_format((float) $order->delivery['fee'], 0) }}
                    </td>
                </tr>
                @endif
            </table>
        </div>

        <div style="border-top: 2px solid #1a1a1a; padding-top: 12px; display: flex; justify-content: space-between; font-size: 16px; font-weight: bold;">
            <span>Total Paid</span>
            <span style="color: #E05A26; float: right;">KSh {{ number_format((float) $order->total_amount, 0) }}</span>
        </div>

        <p style="margin: 24px 0 0; font-size: 12px; color: #9ca3af; text-align: center;">
            Powered by Evopay Checkout
        </p>
    </div>
</body>
</html>