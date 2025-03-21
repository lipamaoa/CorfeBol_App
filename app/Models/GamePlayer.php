<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GamePlayer extends Model
{
    use HasFactory;

    protected $table = 'game_players';
    
    // Definir os campos que podem ser preenchidos em massa
    protected $fillable = [
        'game_id',
        'player_id',
        'initial_position',
        'position_index'
    ];

    // Relacionamentos
    public function game()
    {
        return $this->belongsTo(Game::class);
    }

    public function player()
    {
        return $this->belongsTo(Player::class);
    }
}

