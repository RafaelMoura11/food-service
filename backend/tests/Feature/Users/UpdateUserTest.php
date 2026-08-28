<?php

use App\Models\User;
use Database\Seeders\PermissionSeeder;

beforeEach(fn () => $this->seed(PermissionSeeder::class));

it('permite que um usuário com permissão atualize os dados de um usuário existente', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('usuarios.editar');
    $target = User::factory()->create(['name' => 'Nome Antigo']);

    $response = $this->actingAs($user)->putJson("/api/users/{$target->id}", [
        'name' => 'Nome Novo',
        'email' => $target->email,
    ]);

    $response->assertOk();
    $this->assertDatabaseHas('users', ['id' => $target->id, 'name' => 'Nome Novo']);
});

it('atualiza a senha apenas quando uma nova senha é informada', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('usuarios.editar');
    $target = User::factory()->create(['password' => 'senha-antiga']);
    $originalHash = $target->password;

    $response = $this->actingAs($user)->putJson("/api/users/{$target->id}", [
        'name' => $target->name,
        'email' => $target->email,
    ]);

    $response->assertOk();
    expect($target->fresh()->password)->toBe($originalHash);
});

it('exige dados válidos para atualizar um usuário', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('usuarios.editar');
    $target = User::factory()->create();

    $response = $this->actingAs($user)->putJson("/api/users/{$target->id}", [
        'name' => '',
        'email' => 'nao-e-um-email',
    ]);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['name', 'email']);
});

it('bloqueia a atualização de usuários para quem não tem a permissão', function () {
    $user = User::factory()->create();
    $target = User::factory()->create(['name' => 'Nome Antigo']);

    $response = $this->actingAs($user)->putJson("/api/users/{$target->id}", [
        'name' => 'Nome Novo',
        'email' => $target->email,
    ]);

    $response->assertForbidden();
    $this->assertDatabaseHas('users', ['id' => $target->id, 'name' => 'Nome Antigo']);
});

it('bloqueia a atualização de usuários para visitantes sem sessão', function () {
    $target = User::factory()->create();

    $this->putJson("/api/users/{$target->id}", [
        'name' => 'Nome Novo',
        'email' => $target->email,
    ])->assertUnauthorized();
});
