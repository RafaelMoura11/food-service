<?php

namespace App\Http\Controllers;

use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        // Também acessível a quem só tem funcoes.editar: atribuir Funções a um
        // Usuário existente exige poder ver quem são os Usuários cadastrados.
        abort_unless(Gate::any(['usuarios.listar', 'funcoes.editar']), 403);

        return response()->json(User::with('roles:id,name')->orderBy('name')->get());
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $data = $request->validated();
        $roles = $data['roles'] ?? null;
        unset($data['roles']);

        $user = User::create($data);

        // Atribuir Funções na criação exige a mesma Permissão que atribuí-las
        // depois exige (UserRoleController); usuarios.criar sozinho não basta.
        if ($roles !== null && Gate::allows('funcoes.editar')) {
            $user->syncRoles($roles);
        }

        return response()->json($user->load('roles:id,name'), 201);
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $data = $request->validated();

        if (empty($data['password'])) {
            unset($data['password']);
        }

        $user->update($data);

        return response()->json($user);
    }

    public function destroy(User $user): Response
    {
        $user->delete();

        return response()->noContent();
    }
}
