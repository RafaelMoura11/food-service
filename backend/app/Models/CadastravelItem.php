<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['module', 'name'])]
class CadastravelItem extends Model
{
    /**
     * @param  Builder<CadastravelItem>  $query
     * @return Builder<CadastravelItem>
     */
    public function scopeForModule(Builder $query, string $module): Builder
    {
        return $query->where('module', $module);
    }
}
