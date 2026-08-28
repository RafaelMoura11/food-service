<?php

use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Spatie\Permission\Models\Role;

beforeEach(fn () => $this->seed(PermissionSeeder::class));

it('permite que um usuário com permissão sobre Função atribua Funções a um usuário existente', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('funcoes.editar');
    $target = User::factory()->create();
    $role = Role::create(['name' => 'Inspetor', 'guard_name' => 'web']);

    $response = $this->actingAs($user)->putJson("/api/users/{$target->id}/roles", [
        'roles' => [$role->id],
    ]);

    $response->assertOk();
    expect($target->fresh()->hasRole('Inspetor'))->toBeTrue();
});

it('substitui as Funções atribuídas em vez de somar', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('funcoes.editar');
    $target = User::factory()->create();
    $roleA = Role::create(['name' => 'Função A', 'guard_name' => 'web']);
    $roleB = Role::create(['name' => 'Função B', 'guard_name' => 'web']);
    $target->assignRole($roleA);

    $response = $this->actingAs($user)->putJson("/api/users/{$target->id}/roles", [
        'roles' => [$roleB->id],
    ]);

    $response->assertOk();
    $target->refresh();
    expect($target->hasRole('Função A'))->toBeFalse();
    expect($target->hasRole('Função B'))->toBeTrue();
});

it('permite remover todas as Funções de um usuário', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('funcoes.editar');
    $target = User::factory()->create();
    $role = Role::create(['name' => 'Inspetor', 'guard_name' => 'web']);
    $target->assignRole($role);

    $response = $this->actingAs($user)->putJson("/api/users/{$target->id}/roles", [
        'roles' => [],
    ]);

    $response->assertOk();
    expect($target->fresh()->roles)->toBeEmpty();
});

it('exige que as Funções informadas existam', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('funcoes.editar');
    $target = User::factory()->create();

    $response = $this->actingAs($user)->putJson("/api/users/{$target->id}/roles", [
        'roles' => [999],
    ]);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['roles.0']);
});

it('bloqueia a atribuição de Funções para quem não tem a permissão sobre o módulo Função', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('usuarios.editar');
    $target = User::factory()->create();
    $role = Role::create(['name' => 'Inspetor', 'guard_name' => 'web']);

    $response = $this->actingAs($user)->putJson("/api/users/{$target->id}/roles", [
        'roles' => [$role->id],
    ]);

    $response->assertForbidden();
    expect($target->fresh()->hasRole('Inspetor'))->toBeFalse();
});

it('bloqueia a atribuição de Funções para visitantes sem sessão', function () {
    $target = User::factory()->create();

    $this->putJson("/api/users/{$target->id}/roles", ['roles' => []])->assertUnauthorized();
});
