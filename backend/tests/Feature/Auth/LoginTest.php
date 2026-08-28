<?php

use App\Models\User;

it('permite que um usuário cadastrado faça login com credenciais válidas', function () {
    $user = User::factory()->create(['password' => 'senha-secreta']);

    $response = $this->postJson('/login', [
        'email' => $user->email,
        'password' => 'senha-secreta',
    ]);

    $response->assertOk();
    $this->assertAuthenticatedAs($user);
});

it('bloqueia o login com senha inválida', function () {
    $user = User::factory()->create(['password' => 'senha-secreta']);

    $response = $this->postJson('/login', [
        'email' => $user->email,
        'password' => 'senha-errada',
    ]);

    $response->assertUnprocessable();
    $this->assertGuest();
});

it('bloqueia o login para um e-mail não cadastrado', function () {
    $response = $this->postJson('/login', [
        'email' => 'ninguem@foodservice.local',
        'password' => 'qualquer-senha',
    ]);

    $response->assertUnprocessable();
    $this->assertGuest();
});

it('exige e-mail e senha para logar', function () {
    $response = $this->postJson('/login', []);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['email', 'password']);
});
