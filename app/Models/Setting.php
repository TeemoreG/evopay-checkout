<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['key', 'value'];

    // Helper to easily get a setting from the DB
    public static function get($key, $default = null)
    {
        return self::where('key', $key)->first()?->value ?? $default;
    }

    // Helper to easily set/update a setting in the DB
    public static function set($key, $value)
    {
        self::updateOrCreate(['key' => $key], ['value' => $value]);
    }
}