<?php

use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Spatie\Permission\Models\Role;

it('expõe as permissões efetivas do usuário autenticado', function () {
    $this->seed(PermissionSeeder::class);
    $user = User::factory()->create();
    $user->givePermissionTo('usuarios.listar');

    $this->actingAs($user)
        ->getJson('/api/user')
        ->assertOk()
        ->assertJsonPath('permissions', ['usuarios.listar']);
});

it('expõe todas as permissões existentes para um usuário administrador', function () {
    $this->seed(PermissionSeeder::class);
    $admin = User::factory()->create();
    $admin->assignRole(Role::firstOrCreate(['name' => 'Administrador', 'guard_name' => 'web']));

    $response = $this->actingAs($admin)->getJson('/api/user');

    $response->assertOk();
    expect($response->json('permissions'))->toContain('usuarios.listar', 'usuarios.criar', 'usuarios.editar', 'usuarios.excluir');
});
