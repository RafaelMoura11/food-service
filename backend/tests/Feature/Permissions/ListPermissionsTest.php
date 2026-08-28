<?php

use App\Models\User;
use Database\Seeders\PermissionSeeder;

beforeEach(fn () => $this->seed(PermissionSeeder::class));

it('expõe o catálogo de Permissões para qualquer usuário autenticado', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->getJson('/api/permissions');

    $response->assertOk();
    expect($response->json('*.name'))->toContain('usuarios.listar', 'funcoes.criar');
});

it('bloqueia o catálogo de Permissões para visitantes sem sessão', function () {
    $this->getJson('/api/permissions')->assertUnauthorized();
});
