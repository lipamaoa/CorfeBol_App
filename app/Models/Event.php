<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'player_id'
    ];

    /**
     * Get the player that owns the Event
     */
    public function player()
    {
        return $this->belongsTo(Player::class);
    }
}
