<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AuthenticatedUserController extends Controller
{
    public function show(Request $request)
    {
        return $request->user();
    }
}
