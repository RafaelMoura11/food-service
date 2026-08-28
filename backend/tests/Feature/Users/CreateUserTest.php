<?php

use App\Models\User;
use Database\Seeders\PermissionSeeder;

beforeEach(fn () => $this->seed(PermissionSeeder::class));

it('permite que um usuário com permissão cadastre um novo usuário', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('usuarios.criar');

    $response = $this->actingAs($user)->postJson('/api/users', [
        'name' => 'Novo Usuário',
        'email' => 'novo@foodservice.local',
        'password' => 'senha-secreta',
        'password_confirmation' => 'senha-secreta',
    ]);

    $response->assertCreated();
    $this->assertDatabaseHas('users', ['email' => 'novo@foodservice.local']);
});

it('exige dados de acesso válidos para cadastrar um usuário', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('usuarios.criar');

    $response = $this->actingAs($user)->postJson('/api/users', []);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['name', 'email', 'password']);
});

it('bloqueia o e-mail duplicado ao cadastrar um usuário', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('usuarios.criar');
    $existing = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/users', [
        'name' => 'Novo Usuário',
        'email' => $existing->email,
        'password' => 'senha-secreta',
        'password_confirmation' => 'senha-secreta',
    ]);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['email']);
});

it('bloqueia o cadastro de usuários para quem não tem a permissão', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/users', [
        'name' => 'Novo Usuário',
        'email' => 'novo@foodservice.local',
        'password' => 'senha-secreta',
        'password_confirmation' => 'senha-secreta',
    ]);

    $response->assertForbidden();
    $this->assertDatabaseMissing('users', ['email' => 'novo@foodservice.local']);
});

it('bloqueia o cadastro de usuários para visitantes sem sessão', function () {
    $this->postJson('/api/users', [
        'name' => 'Novo Usuário',
        'email' => 'novo@foodservice.local',
        'password' => 'senha-secreta',
        'password_confirmation' => 'senha-secreta',
    ])->assertUnauthorized();
});
