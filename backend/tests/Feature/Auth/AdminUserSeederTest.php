<?php

use App\Models\User;
use Database\Seeders\AdminUserSeeder;
use Illuminate\Support\Facades\Gate;

it('cria um usuário administrador com a função "Administrador"', function () {
    $this->seed(AdminUserSeeder::class);

    $admin = User::where('email', config('seeder.admin.email'))->first();

    expect($admin)->not->toBeNull();
    expect($admin->hasRole('Administrador'))->toBeTrue();
});

it('concede acesso irrestrito ao usuário administrador', function () {
    $this->seed(AdminUserSeeder::class);

    $admin = User::where('email', config('seeder.admin.email'))->first();

    expect(Gate::forUser($admin)->allows('qualquer-permissao-que-ainda-nao-existe'))->toBeTrue();
});

it('permite que o usuário administrador semeado faça login com as credenciais configuradas', function () {
    $this->seed(AdminUserSeeder::class);

    $response = $this->postJson('/login', [
        'email' => config('seeder.admin.email'),
        'password' => config('seeder.admin.password'),
    ]);

    $response->assertOk();
});
