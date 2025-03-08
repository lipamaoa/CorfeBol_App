<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Game extends Model
{
    use HasFactory;

    protected $fillable = [
        'team_a_id',
        'team_b_id',
        'date',
        'location',
        'status'
    ];

    protected $casts = [
        'date' => 'datetime',
    ];

    public function teamA()
    {
        return $this->belongsTo(Team::class, 'team_a_id');
    }

    public function teamB()
    {
        return $this->belongsTo(Team::class, 'team_b_id');
    }

    public function players()
    {
        return $this->belongsToMany(Player::class, 'game_players')
            ->withTimestamps();
    }

    public function stats()
    {
        return $this->hasMany(Stat::class);
    }
}
