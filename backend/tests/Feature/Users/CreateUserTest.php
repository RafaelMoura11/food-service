<?php

use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Spatie\Permission\Models\Role;

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

it('permite atribuir Funções já na criação para quem também tem funcoes.editar', function () {
    $user = User::factory()->create();
    $user->givePermissionTo(['usuarios.criar', 'funcoes.editar']);
    $role = Role::create(['name' => 'Inspetor', 'guard_name' => 'web']);

    $response = $this->actingAs($user)->postJson('/api/users', [
        'name' => 'Novo Usuário',
        'email' => 'novo@foodservice.local',
        'password' => 'senha-secreta',
        'password_confirmation' => 'senha-secreta',
        'roles' => [$role->id],
    ]);

    $response->assertCreated();
    $created = User::where('email', 'novo@foodservice.local')->firstOrFail();
    expect($created->hasRole('Inspetor'))->toBeTrue();
    expect($response->json('roles.0.name'))->toBe('Inspetor');
});

it('ignora Funções enviadas na criação por quem não tem funcoes.editar', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('usuarios.criar');
    $role = Role::create(['name' => 'Inspetor', 'guard_name' => 'web']);

    $response = $this->actingAs($user)->postJson('/api/users', [
        'name' => 'Novo Usuário',
        'email' => 'novo@foodservice.local',
        'password' => 'senha-secreta',
        'password_confirmation' => 'senha-secreta',
        'roles' => [$role->id],
    ]);

    $response->assertCreated();
    $created = User::where('email', 'novo@foodservice.local')->firstOrFail();
    expect($created->hasRole('Inspetor'))->toBeFalse();
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
