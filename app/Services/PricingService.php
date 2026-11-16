<?php

namespace App\Services;

use App\Models\ProductUnit;
use InvalidArgumentException;

class PricingService
{
    public function calculate(ProductUnit $unit, int $qty): array
    {
        if (!$unit->is_active) {
            throw new InvalidArgumentException("Unit is not active.");
        }

        if ($qty < $unit->min_qty) {
            throw new InvalidArgumentException(
                "Minimum quantity for {$unit->label} is {$unit->min_qty}."
            );
        }

        if ($unit->requires_quote) {
            return [
                'unit_price'     => 0.0,
                'total'          => 0.0,
                'break'          => null,
                'requires_quote' => true,
            ];
        }

        if ($unit->step_qty > 1 && ($qty % $unit->step_qty) !== 0) {
            throw new InvalidArgumentException(
                "Quantity for {$unit->label} must be in multiples of {$unit->step_qty}."
            );
        }

        $break = $unit->priceBreaks()
            ->where('is_active', true)
            ->where('min_qty', '<=', $qty)
            ->where(function ($q) use ($qty) {
                $q->whereNull('max_qty')->orWhere('max_qty', '>=', $qty);
            })
            ->orderByDesc('min_qty')
            ->first();

        if (!$break) {
            throw new InvalidArgumentException(
                "No price available for {$qty} x {$unit->label}."
            );
        }

        $unitPrice = (float) $break->unit_price;

        return [
            'unit_price'     => $unitPrice,
            'total'          => round($unitPrice * $qty, 2),
            'break'          => $break,
            'requires_quote' => false,
        ];
    }
}