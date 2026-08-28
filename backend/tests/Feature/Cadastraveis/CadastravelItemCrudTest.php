<?php

use App\Models\CadastravelItem;
use App\Models\User;
use Database\Seeders\PermissionSeeder;

beforeEach(fn () => $this->seed(PermissionSeeder::class));

// Lê o arquivo de config diretamente (sem o helper config(), que exige o
// container já resolvido) porque datasets do Pest são avaliados antes do
// bootstrap da aplicação.
dataset('modulos cadastraveis', fn () => array_keys((require __DIR__.'/../../../config/cadastraveis.php')['modules']));

it('permite que um usuário com Permissão crie, liste, edite e exclua registros do módulo', function (string $module) {
    $user = User::factory()->create();
    $user->givePermissionTo(["{$module}.listar", "{$module}.criar", "{$module}.editar", "{$module}.excluir"]);

    $created = $this->actingAs($user)->postJson("/api/cadastraveis/{$module}", ['name' => 'Item A']);
    $created->assertCreated();
    $itemId = $created->json('id');
    $this->assertDatabaseHas('cadastravel_items', ['id' => $itemId, 'module' => $module, 'name' => 'Item A']);

    $listed = $this->actingAs($user)->getJson("/api/cadastraveis/{$module}");
    $listed->assertOk();
    expect($listed->json())->toHaveCount(1);
    expect($listed->json('0.name'))->toBe('Item A');

    $updated = $this->actingAs($user)->putJson("/api/cadastraveis/{$module}/{$itemId}", ['name' => 'Item B']);
    $updated->assertOk();
    $this->assertDatabaseHas('cadastravel_items', ['id' => $itemId, 'name' => 'Item B']);

    $deleted = $this->actingAs($user)->deleteJson("/api/cadastraveis/{$module}/{$itemId}");
    $deleted->assertNoContent();
    $this->assertDatabaseMissing('cadastravel_items', ['id' => $itemId]);
})->with('modulos cadastraveis');

it('bloqueia as quatro ações do módulo para um Usuário sem a Permissão correspondente', function (string $module) {
    $user = User::factory()->create();
    $item = CadastravelItem::create(['module' => $module, 'name' => 'Item existente']);

    $this->actingAs($user)->getJson("/api/cadastraveis/{$module}")->assertForbidden();
    $this->actingAs($user)->postJson("/api/cadastraveis/{$module}", ['name' => 'Novo'])->assertForbidden();
    $this->actingAs($user)->putJson("/api/cadastraveis/{$module}/{$item->id}", ['name' => 'Novo'])->assertForbidden();
    $this->actingAs($user)->deleteJson("/api/cadastraveis/{$module}/{$item->id}")->assertForbidden();

    $this->assertDatabaseHas('cadastravel_items', ['id' => $item->id, 'name' => 'Item existente']);
})->with('modulos cadastraveis');

it('mantém a Permissão de um módulo independente das dos demais', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('produtos.listar');

    $this->actingAs($user)->getJson('/api/cadastraveis/produtos')->assertOk();
    $this->actingAs($user)->getJson('/api/cadastraveis/filial')->assertForbidden();
});

it('bloqueia o acesso aos módulos Cadastráveis para visitantes sem sessão', function () {
    $this->getJson('/api/cadastraveis/produtos')->assertUnauthorized();
});

it('exige um nome para criar um registro', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('produtos.criar');

    $response = $this->actingAs($user)->postJson('/api/cadastraveis/produtos', []);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['name']);
});

it('bloqueia o nome duplicado dentro do mesmo módulo', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('produtos.criar');
    CadastravelItem::create(['module' => 'produtos', 'name' => 'Arroz']);

    $response = $this->actingAs($user)->postJson('/api/cadastraveis/produtos', ['name' => 'Arroz']);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['name']);
});

it('bloqueia editar ou excluir um registro pela rota de outro módulo, mesmo com Permissão nele', function () {
    $user = User::factory()->create();
    $user->givePermissionTo(['produtos.editar', 'produtos.excluir']);
    $item = CadastravelItem::create(['module' => 'filial', 'name' => 'Matriz']);

    $this->actingAs($user)->putJson("/api/cadastraveis/produtos/{$item->id}", ['name' => 'Novo nome'])->assertNotFound();
    $this->actingAs($user)->deleteJson("/api/cadastraveis/produtos/{$item->id}")->assertNotFound();

    $this->assertDatabaseHas('cadastravel_items', ['id' => $item->id, 'module' => 'filial', 'name' => 'Matriz']);
});

it('permite o mesmo nome em módulos Cadastráveis diferentes', function () {
    $user = User::factory()->create();
    $user->givePermissionTo(['produtos.criar', 'filial.criar']);
    CadastravelItem::create(['module' => 'filial', 'name' => 'Matriz']);

    $response = $this->actingAs($user)->postJson('/api/cadastraveis/produtos', ['name' => 'Matriz']);

    $response->assertCreated();
});
