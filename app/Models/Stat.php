<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class Stat extends Model
{
    use HasFactory;

    protected $fillable = [
        'game_id',
        'player_id',
        'action_id',
        'success',
        'event_type',
        'possession_id',
        'possession_type',
        'description',
        'time'
    ];

    protected $casts = [
        'success' => 'boolean',
    ];

    public function game()
    {
        return $this->belongsTo(Game::class);
    }

    public function player()
    {
        return $this->belongsTo(Player::class);
    }

    public function action()
    {
        return $this->belongsTo(Action::class);
    }
}
