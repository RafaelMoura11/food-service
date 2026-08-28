<?php

use App\Http\Controllers\Auth\AuthenticatedUserController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthenticatedUserController::class, 'show']);

    Route::get('/users', [UserController::class, 'index'])->middleware('can:usuarios.listar');
    Route::post('/users', [UserController::class, 'store'])->middleware('can:usuarios.criar');
    Route::put('/users/{user}', [UserController::class, 'update'])->middleware('can:usuarios.editar');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->middleware('can:usuarios.excluir');
});
