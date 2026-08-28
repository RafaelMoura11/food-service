<?php

namespace App\Http\Controllers;

use App\Http\Requests\Cadastravel\StoreCadastravelItemRequest;
use App\Http\Requests\Cadastravel\UpdateCadastravelItemRequest;
use App\Models\CadastravelItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class CadastravelItemController extends Controller
{
    public function index(string $module): JsonResponse
    {
        return response()->json(
            CadastravelItem::forModule($module)->orderBy('name')->get(['id', 'name'])
        );
    }

    public function store(StoreCadastravelItemRequest $request, string $module): JsonResponse
    {
        $item = CadastravelItem::create([
            'module' => $module,
            'name' => $request->validated('name'),
        ]);

        return response()->json($item, 201);
    }

    // A ordem dos parâmetros ($item antes de $module) importa: o dispatcher de
    // rotas do Laravel injeta dependências posicionalmente a partir de
    // route->parametersWithoutNulls(), que traz primeiro os segmentos da URI
    // ({item}) e só depois os valores de defaults() (module) — inverter a
    // ordem aqui faz o Laravel injetar os valores trocados.
    public function update(UpdateCadastravelItemRequest $request, CadastravelItem $item, string $module): JsonResponse
    {
        abort_unless($item->module === $module, 404);

        $item->update(['name' => $request->validated('name')]);

        return response()->json($item);
    }

    public function destroy(CadastravelItem $item, string $module): Response
    {
        abort_unless($item->module === $module, 404);

        $item->delete();

        return response()->noContent();
    }
}
