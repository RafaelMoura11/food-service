<?php

namespace App\Http\Controllers;

use App\Http\Requests\User\UpdateUserRolesRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class UserRoleController extends Controller
{
    public function update(UpdateUserRolesRequest $request, User $user): JsonResponse
    {
        $user->syncRoles($request->validated()['roles']);

        return response()->json($user->load('roles:id,name'));
    }
}
