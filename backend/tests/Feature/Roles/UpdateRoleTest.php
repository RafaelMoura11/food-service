<?php

use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(fn () => $this->seed(PermissionSeeder::class));

it('permite que um usuário com permissão atualize o nome e as Permissões de uma Função', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('funcoes.editar');
    $role = Role::create(['name' => 'Inspetor', 'guard_name' => 'web']);
    $role->givePermissionTo('usuarios.listar');
    $novaPermissaoId = Permission::where('name', 'usuarios.criar')->value('id');

    $response = $this->actingAs($user)->putJson("/api/roles/{$role->id}", [
        'name' => 'Inspetor Sênior',
        'permissions' => [$novaPermissaoId],
    ]);

    $response->assertOk();
    $this->assertDatabaseHas('roles', ['id' => $role->id, 'name' => 'Inspetor Sênior']);
    expect($role->fresh()->permissions->pluck('name')->all())->toBe(['usuarios.criar']);
});

it('exige um nome válido para atualizar uma Função', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('funcoes.editar');
    $role = Role::create(['name' => 'Inspetor', 'guard_name' => 'web']);

    $response = $this->actingAs($user)->putJson("/api/roles/{$role->id}", ['name' => '']);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['name']);
});

it('bloqueia a atualização de Funções para quem não tem a permissão', function () {
    $user = User::factory()->create();
    $role = Role::create(['name' => 'Inspetor', 'guard_name' => 'web']);

    $response = $this->actingAs($user)->putJson("/api/roles/{$role->id}", ['name' => 'Outro Nome']);

    $response->assertForbidden();
    $this->assertDatabaseHas('roles', ['id' => $role->id, 'name' => 'Inspetor']);
});

it('bloqueia a atualização de Funções para visitantes sem sessão', function () {
    $role = Role::create(['name' => 'Inspetor', 'guard_name' => 'web']);

    $this->putJson("/api/roles/{$role->id}", ['name' => 'Outro Nome'])->assertUnauthorized();
});
