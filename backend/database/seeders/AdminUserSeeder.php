<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class AdminUserSeeder extends Seeder
{
    /**
     * Cria a Função "Administrador" (acesso irrestrito, ver AppServiceProvider)
     * e o primeiro Usuário administrador, ponto de entrada para cadastrar os
     * demais Usuários e Funções do sistema.
     */
    public function run(): void
    {
        $role = Role::firstOrCreate([
            'name' => 'Administrador',
            'guard_name' => 'web',
        ]);

        $admin = User::firstOrCreate(
            ['email' => config('seeder.admin.email')],
            [
                'name' => 'Administrador',
                'password' => config('seeder.admin.password'),
                'email_verified_at' => now(),
            ]
        );

        $admin->assignRole($role);
    }
}
