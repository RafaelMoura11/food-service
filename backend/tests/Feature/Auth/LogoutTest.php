<?php

use App\Models\User;

it('permite que um usuário autenticado encerre a sessão', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/logout')
        ->assertNoContent();

    $this->assertGuest();
});

it('bloqueia o logout sem uma sessão válida', function () {
    $this->postJson('/logout')->assertUnauthorized();
});
