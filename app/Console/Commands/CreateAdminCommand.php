<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class CreateAdminCommand extends Command
{
    protected $signature = 'admin:create
                            {email : Admin email address}
                            {--name=Evopay Admin : Admin full name}
                            {--password= : Admin password}';

    protected $description = 'Create or promote a platform super-admin user';

    public function handle(): int
    {
        $email = trim($this->argument('email'));
        $name = trim($this->option('name'));
        $password = $this->option('password') ?: $this->secret('Enter admin password (min 8 chars)');

        if (strlen((string) $password) < 8) {
            $this->error('Password must be at least 8 characters.');
            return Command::FAILURE;
        }

        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => $password,
                'role' => 'admin',
                'merchant_id' => null,
            ]
        );

        $this->info("✓ Admin user ready: {$user->email} (ID: {$user->id})");
        return Command::SUCCESS;
    }
}