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
     * acesso a cada módulo do sistema, incluindo um módulo por entrada de
     * config('cadastraveis.modules').
     */
    public function run(): void
    {
        $modules = [...self::MODULES, ...array_keys(config('cadastraveis.modules'))];

        foreach ($modules as $module) {
            foreach (self::ACTIONS as $action) {
                Permission::firstOrCreate([
                    'name' => "{$module}.{$action}",
                    'guard_name' => 'web',
                ]);
            }
        }
    }
}
