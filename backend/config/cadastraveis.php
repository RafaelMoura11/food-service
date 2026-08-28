<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Módulos Cadastráveis
    |--------------------------------------------------------------------------
    |
    | Cada entrada vira, automaticamente, um conjunto de rotas em
    | routes/api.php (/api/cadastraveis/{slug}), quatro Permissões
    | independentes (slug.listar/criar/editar/excluir, seedadas em
    | PermissionSeeder) e um item de menu sob "Cadastráveis" no frontend
    | (mantenha esta lista em sincronia com frontend/src/config/cadastraveis.js).
    | Adicionar um novo módulo Cadastrável é só acrescentar uma linha aqui.
    |
    */

    'modules' => [
        'produtos' => 'Produtos',
        'centro-de-custo' => 'Centro de custo',
        'filial' => 'Filial',
        'checklist' => 'Checklist',
        'nao-conformidades' => 'Não conformidades',
        'transportaveis' => 'Transportáveis',
        'rdo' => 'R.D.O.',
        'agenda-de-higienizacao' => 'Agenda de higienização',
        'relatorios' => 'Relatórios',
        'ativo' => 'Ativo',
        'ambientes' => 'Ambientes',
        'categorias-rdo' => 'Categorias RDO',
        'equipamentos' => 'Equipamentos',
        'fornecedores' => 'Fornecedores',
        'pragas' => 'Pragas',
        'pratos-preparacao' => 'Pratos/Preparação',
        'projetos' => 'Projetos',
        'rotas' => 'Rotas',
        'reservatorios' => 'Reservatórios',
        'unidades' => 'Unidades',
        'veiculos' => 'Veículos',
        'cadastro-de-categorias' => 'Cadastro de categorias',
        'checklist-customizavel' => 'Checklist Customizável',
        'setores' => 'Setores',
        'dispositivos' => 'Dispositivos',
    ],

];
