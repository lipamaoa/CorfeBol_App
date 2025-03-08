<?php

// Create this as database/seeders/TestGameSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Team;
use App\Models\Player;
use App\Models\Game;
use App\Models\Action;
use Carbon\Carbon;

class TestGameSeeder extends Seeder
{
    public function run()
    {
        // Create two teams
        $teamA = Team::create([
            'name' => 'Korfball Tigers',
            'photo' => null
        ]);

        $teamB = Team::create([
            'name' => 'Korfball Eagles',
            'photo' => null
        ]);

        // Create players for Team A
        $teamAPlayers = [
            ['name' => 'John Smith', 'gender' => 'male', 'position' => 'attack'],
            ['name' => 'Emma Johnson', 'gender' => 'female', 'position' => 'attack'],
            ['name' => 'Michael Brown', 'gender' => 'male', 'position' => 'defense'],
            ['name' => 'Sophia Davis', 'gender' => 'female', 'position' => 'defense'],
            ['name' => 'James Wilson', 'gender' => 'male', 'position' => 'attack'], // substitute
            ['name' => 'Olivia Martinez', 'gender' => 'female', 'position' => 'defense'], // substitute
        ];

        foreach ($teamAPlayers as $playerData) {
            Player::create([
                'team_id' => $teamA->id,
                'name' => $playerData['name'],
                'gender' => $playerData['gender'],
                'position' => $playerData['position'],
                'photo' => null
            ]);
        }

        // Create players for Team B
        $teamBPlayers = [
            ['name' => 'William Taylor', 'gender' => 'male', 'position' => 'attack'],
            ['name' => 'Isabella Anderson', 'gender' => 'female', 'position' => 'attack'],
            ['name' => 'Alexander Thomas', 'gender' => 'male', 'position' => 'defense'],
            ['name' => 'Mia Rodriguez', 'gender' => 'female', 'position' => 'defense'],
            ['name' => 'Benjamin White', 'gender' => 'male', 'position' => 'attack'], // substitute
            ['name' => 'Charlotte Lewis', 'gender' => 'female', 'position' => 'defense'], // substitute
        ];

        foreach ($teamBPlayers as $playerData) {
            Player::create([
                'team_id' => $teamB->id,
                'name' => $playerData['name'],
                'gender' => $playerData['gender'],
                'position' => $playerData['position'],
                'photo' => null
            ]);
        }

        // Create a game
        $game = Game::create([
            'team_a_id' => $teamA->id,
            'team_b_id' => $teamB->id,
            'date' => Carbon::now()->addDays(3)->format('Y-m-d'),
            'location' => 'Korfball Arena',
            'status' => 'scheduled'
        ]);

        // Make sure action codes exist
        if (Action::count() === 0) {
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

        echo "Test game created with ID: {$game->id}\n";
        echo "Team A: {$teamA->name} (ID: {$teamA->id})\n";
        echo "Team B: {$teamB->name} (ID: {$teamB->id})\n";
    }
}