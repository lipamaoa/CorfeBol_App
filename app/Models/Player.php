<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Player extends Model
{
    protected $fillable = ['team_id', 'name', 'gender', 'position', 'photo'];

    // Relação com tabela teams
    public function team()
    {
        return $this->belongsTo(Team::class);
    }
}
