<?php

use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Spatie\Permission\Models\Role;

beforeEach(fn () => $this->seed(PermissionSeeder::class));

it('permite que um usuário com permissão remova uma Função existente', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('funcoes.excluir');
    $role = Role::create(['name' => 'Inspetor', 'guard_name' => 'web']);

    $response = $this->actingAs($user)->deleteJson("/api/roles/{$role->id}");

    $response->assertNoContent();
    $this->assertDatabaseMissing('roles', ['id' => $role->id]);
});

it('bloqueia a remoção de Funções para quem não tem a permissão', function () {
    $user = User::factory()->create();
    $role = Role::create(['name' => 'Inspetor', 'guard_name' => 'web']);

    $response = $this->actingAs($user)->deleteJson("/api/roles/{$role->id}");

    $response->assertForbidden();
    $this->assertDatabaseHas('roles', ['id' => $role->id]);
});

it('bloqueia a remoção de Funções para visitantes sem sessão', function () {
    $role = Role::create(['name' => 'Inspetor', 'guard_name' => 'web']);

    $this->deleteJson("/api/roles/{$role->id}")->assertUnauthorized();
});
