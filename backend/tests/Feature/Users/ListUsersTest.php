<?php

use App\Models\User;
use Database\Seeders\PermissionSeeder;

beforeEach(fn () => $this->seed(PermissionSeeder::class));

it('permite que um usuário com permissão liste os usuários cadastrados', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('usuarios.listar');
    User::factory()->count(2)->create();

    $response = $this->actingAs($user)->getJson('/api/users');

    $response->assertOk();
    expect($response->json())->toHaveCount(3);
});

it('bloqueia a listagem de usuários para quem não tem a permissão', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson('/api/users')
        ->assertForbidden();
});

it('bloqueia a listagem de usuários para visitantes sem sessão', function () {
    $this->getJson('/api/users')->assertUnauthorized();
});
