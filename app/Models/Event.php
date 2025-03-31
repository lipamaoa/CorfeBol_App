<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'player_id',
        'game_id',
        'start_time',
        'end_time',
    ];

    /**
     * Get the player that owns the Event
     */
    public function player()
    {
        return $this->belongsTo(Player::class);
    }


    /**
     * Get the game that owns the Event
     */
    public function game()
    {
        return $this->belongsTo(Game::class);
    }

     /**
     * Get the stats associated with this event
     */
    public function stats()
    {
        return $this->hasMany(Stat::class);
    }
}
