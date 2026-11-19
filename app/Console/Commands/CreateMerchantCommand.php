<?php

namespace App\Console\Commands;

use App\Models\Merchant;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class CreateMerchantCommand extends Command
{
    protected $signature = 'merchant:create 
                            {name : Business name of the merchant}
                            {--email= : Contact email}
                            {--mode=live : API key mode (live or test)}
                            {--webhook= : Default webhook URL}';

    protected $description = 'Create a new merchant and generate their public and secret API keys';

    public function handle(): int
    {
        $name = trim($this->argument('name'));
        $email = $this->option('email');
        $mode = in_array(strtolower($this->option('mode')), ['live', 'test']) ? strtolower($this->option('mode')) : 'live';
        $webhook = $this->option('webhook');

        $slug = Str::slug($name);
        $originalSlug = $slug;
        $counter = 1;
        while (Merchant::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter++;
        }

        $merchant = Merchant::create([
            'name' => $name,
            'slug' => $slug,
            'email' => $email,
            'webhook_url' => $webhook,
            'webhook_secret' => 'whsec_' . Str::random(32),
            'status' => 'active',
        ]);

        $keys = $merchant->createApiKey('Default API Key', $mode);

        $this->newLine();
        $this->info("✓ Merchant '{$merchant->name}' created successfully!");
        $this->newLine();
        $this->table(
            ['Field', 'Value'],
            [
                ['Merchant ID', $merchant->id],
                ['Merchant Slug', $merchant->slug],
                ['Status', $merchant->status],
                ['Webhook Secret', $merchant->webhook_secret],
                ['Public Key', $keys['public_key']],
                ['Secret Key', $keys['secret_key']],
            ]
        );
        $this->newLine();
        $this->warn('IMPORTANT: Copy the Secret Key now. It is hashed in the database and cannot be recovered if lost.');
        $this->newLine();

        return Command::SUCCESS;
    }
}