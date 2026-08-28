<?php

use App\Http\Controllers\Auth\AuthenticatedUserController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserRoleController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthenticatedUserController::class, 'show']);

    // A autorização de /users combina usuarios.listar OU funcoes.editar dentro
    // do controller (Gate::any), já que o middleware `can:` não expressa "ou".
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store'])->middleware('can:usuarios.criar');
    Route::put('/users/{user}', [UserController::class, 'update'])->middleware('can:usuarios.editar');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->middleware('can:usuarios.excluir');
    Route::put('/users/{user}/roles', [UserRoleController::class, 'update'])->middleware('can:funcoes.editar');

    Route::get('/roles', [RoleController::class, 'index'])->middleware('can:funcoes.listar');
    Route::post('/roles', [RoleController::class, 'store'])->middleware('can:funcoes.criar');
    Route::put('/roles/{role}', [RoleController::class, 'update'])->middleware('can:funcoes.editar');
    Route::delete('/roles/{role}', [RoleController::class, 'destroy'])->middleware('can:funcoes.excluir');

    // Catálogos abertos a qualquer Usuário autenticado, só para montar as UIs
    // de atribuição; as mutações seguem protegidas pelas rotas acima.
    Route::get('/roles/options', [RoleController::class, 'options']);
    Route::get('/permissions', [PermissionController::class, 'index']);
});
