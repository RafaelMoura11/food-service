<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    private const MODULES = ['usuarios', 'funcoes'];

    private const ACTIONS = ['listar', 'criar', 'editar', 'excluir'];

    /**
     * Cria as Permissões granulares (módulo.ação) usadas para restringir o
     * acesso a cada módulo do sistema.
     */
    public function run(): void
    {
        foreach (self::MODULES as $module) {
            foreach (self::ACTIONS as $action) {
                Permission::firstOrCreate([
                    'name' => "{$module}.{$action}",
                    'guard_name' => 'web',
                ]);
            }
        }
    }
}
