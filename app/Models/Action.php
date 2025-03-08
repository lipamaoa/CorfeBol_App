<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Action extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'description'
    ];

    public function stats()
    {
        return $this->hasMany(Stat::class);
    }
}
