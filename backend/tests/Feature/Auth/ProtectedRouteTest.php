<?php

use App\Models\User;

it('bloqueia requisições à API sem sessão válida', function () {
    $this->getJson('/api/user')->assertUnauthorized();
});

it('permite acesso à API para um usuário com sessão válida', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson('/api/user')
        ->assertOk()
        ->assertJsonPath('email', $user->email);
});
