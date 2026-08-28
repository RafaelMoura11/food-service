<?php

use App\Models\User;
use Spatie\Permission\Models\Role;

it('expõe o catálogo de Funções para qualquer usuário autenticado, sem exigir Permissão sobre o módulo', function () {
    $user = User::factory()->create();
    Role::create(['name' => 'Inspetor', 'guard_name' => 'web']);

    $response = $this->actingAs($user)->getJson('/api/roles/options');

    $response->assertOk();
    expect($response->json('*.name'))->toContain('Inspetor');
});

it('bloqueia o catálogo de Funções para visitantes sem sessão', function () {
    $this->getJson('/api/roles/options')->assertUnauthorized();
});
