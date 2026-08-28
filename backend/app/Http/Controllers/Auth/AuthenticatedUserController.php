<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Spatie\Permission\Models\Permission;

class AuthenticatedUserController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            ...$user->toArray(),
            // Verifica cada Permissão existente via Gate (em vez de listar as
            // do próprio Usuário) para respeitar o bypass do Administrador
            // definido em AppServiceProvider, sem duplicar essa regra aqui.
            'permissions' => Permission::pluck('name')
                ->filter(fn (string $permission) => Gate::forUser($user)->allows($permission))
                ->values()
                ->all(),
        ]);
    }
}
