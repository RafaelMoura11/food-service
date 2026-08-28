<?php

use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(fn () => $this->seed(PermissionSeeder::class));

it('permite que um usuário com permissão crie uma nova Função com Permissões', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('funcoes.criar');

    $response = $this->actingAs($user)->postJson('/api/roles', [
        'name' => 'Inspetor',
        'permissions' => [
            Permission::where('name', 'usuarios.listar')->value('id'),
        ],
    ]);

    $response->assertCreated();
    $this->assertDatabaseHas('roles', ['name' => 'Inspetor']);
    expect($response->json('permissions.0.name'))->toBe('usuarios.listar');
});

it('permite criar uma Função sem Permissões', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('funcoes.criar');

    $response = $this->actingAs($user)->postJson('/api/roles', ['name' => 'Sem Acesso']);

    $response->assertCreated();
    $this->assertDatabaseHas('roles', ['name' => 'Sem Acesso']);
});

it('exige um nome para criar uma Função', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('funcoes.criar');

    $response = $this->actingAs($user)->postJson('/api/roles', []);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['name']);
});

it('bloqueia o nome duplicado ao criar uma Função', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('funcoes.criar');
    Role::create(['name' => 'Inspetor', 'guard_name' => 'web']);

    $response = $this->actingAs($user)->postJson('/api/roles', ['name' => 'Inspetor']);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['name']);
});

it('bloqueia a criação de Funções para quem não tem a permissão', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/roles', ['name' => 'Inspetor']);

    $response->assertForbidden();
    $this->assertDatabaseMissing('roles', ['name' => 'Inspetor']);
});

it('bloqueia a criação de Funções para visitantes sem sessão', function () {
    $this->postJson('/api/roles', ['name' => 'Inspetor'])->assertUnauthorized();
});
