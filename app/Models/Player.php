<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Player extends Model
{
    use HasFactory;

    protected $fillable = [
        'team_id',
        'name',
        'gender',
        'position',
        'photo'
    ];

    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    public function games()
    {
        return $this->belongsToMany(Game::class, 'game_players')
            ->withTimestamps();
    }

    public function stats()
    {
        return $this->hasMany(Stat::class);
    }
}
