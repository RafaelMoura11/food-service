<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Administrador Seeder
    |--------------------------------------------------------------------------
    |
    | Credentials used by the AdminUserSeeder to bootstrap the first Usuário
    | administrador. Override via ADMIN_EMAIL / ADMIN_PASSWORD per environment.
    |
    */

    'admin' => [
        'email' => env('ADMIN_EMAIL', 'admin@foodservice.local'),
        'password' => env('ADMIN_PASSWORD', 'password'),
    ],

];
