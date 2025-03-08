<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Action;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add default action codes
        $actions = [
            ['code' => 'G', 'description' => 'Goal'],
            ['code' => 'A', 'description' => 'Assist'],
            ['code' => 'RG', 'description' => 'Rebound Won'],
            ['code' => 'RP', 'description' => 'Rebound Lost'],
            ['code' => 'D', 'description' => 'Defense'],
            ['code' => 'MP', 'description' => 'Bad Pass'],
            ['code' => 'Pa', 'description' => 'Traveling'],
            ['code' => 'LC', 'description' => 'Short Shot'],
            ['code' => 'LM', 'description' => 'Mid Shot'],
            ['code' => 'LL', 'description' => 'Long Shot'],
            ['code' => 'P', 'description' => 'Layup'],
            ['code' => 'L', 'description' => 'Free Throw'],
            ['code' => 'Pe', 'description' => 'Penalty'],
            ['code' => 'F', 'description' => 'Foul'],
            ['code' => 'S', 'description' => 'Substitution'],
            ['code' => 'PS', 'description' => 'Position Switch'],
            ['code' => 'T', 'description' => 'Timeout'],
            ['code' => 'O', 'description' => 'Other'],
        ];

        foreach ($actions as $action) {
            Action::create($action);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Action::truncate();
    }
};