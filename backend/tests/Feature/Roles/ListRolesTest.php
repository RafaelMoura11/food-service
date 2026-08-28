<?php

use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Spatie\Permission\Models\Role;

beforeEach(fn () => $this->seed(PermissionSeeder::class));

it('permite que um usuário com permissão liste as Funções cadastradas com suas Permissões', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('funcoes.listar');
    $role = Role::create(['name' => 'Inspetor', 'guard_name' => 'web']);
    $role->givePermissionTo('usuarios.listar');

    $response = $this->actingAs($user)->getJson('/api/roles');

    $response->assertOk();
    expect($response->json())->toHaveCount(1);
    expect($response->json('0.permissions.0.name'))->toBe('usuarios.listar');
});

it('bloqueia a listagem de Funções para quem não tem a permissão', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->getJson('/api/roles')->assertForbidden();
});

it('bloqueia a listagem de Funções para visitantes sem sessão', function () {
    $this->getJson('/api/roles')->assertUnauthorized();
});
