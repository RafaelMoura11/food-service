<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Um Usuário com a Função "Administrador" tem acesso irrestrito,
        // independentemente das Permissões existirem ou não.
        Gate::before(fn (User $user) => $user->hasRole('Administrador') ? true : null);
    }
}
