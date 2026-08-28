<?php

use App\Models\User;
use Database\Seeders\PermissionSeeder;

beforeEach(fn () => $this->seed(PermissionSeeder::class));

it('permite que um usuário com permissão remova um usuário existente', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('usuarios.excluir');
    $target = User::factory()->create();

    $response = $this->actingAs($user)->deleteJson("/api/users/{$target->id}");

    $response->assertNoContent();
    $this->assertDatabaseMissing('users', ['id' => $target->id]);
});

it('bloqueia a remoção de usuários para quem não tem a permissão', function () {
    $user = User::factory()->create();
    $target = User::factory()->create();

    $response = $this->actingAs($user)->deleteJson("/api/users/{$target->id}");

    $response->assertForbidden();
    $this->assertDatabaseHas('users', ['id' => $target->id]);
});

it('bloqueia a remoção de usuários para visitantes sem sessão', function () {
    $target = User::factory()->create();

    $this->deleteJson("/api/users/{$target->id}")->assertUnauthorized();
});
