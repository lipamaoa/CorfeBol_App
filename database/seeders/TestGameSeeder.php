<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Team;
use App\Models\Player;
use App\Models\Game;
use App\Models\Action;
use App\Models\Stat;
use Illuminate\Support\Facades\DB;

class TestGameSeeder extends Seeder
{
    public function run()
    {
        // 🔴 Desativar temporariamente as verificações de chave estrangeira
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        // Apagar todos os dados manualmente (sem `truncate`)
        Stat::query()->delete();
        Player::query()->delete();
        Team::query()->delete();
        Game::query()->delete();
        Action::query()->delete();

        // 🔵 Reativar as verificações de chave estrangeira
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        // Criar Equipas
        $teamA = Team::create([
            'name' => 'Sporting Korfball',
          
        ]);

        $teamB = Team::create([
            'name' => 'Barcelona Korfball',
            
        ]);

     

      

        // Criar Jogadores para a equipa A
        $playersA = [];
        $positions = ['attack', 'attack', 'defense', 'defense', 'attack', 'defense', 'attack', 'defense'];
        $names = ['João Silva', 'Ana Costa', 'Pedro Mendes', 'Maria Santos', 'Rui Fonseca', 'Sofia Ribeiro', 'Carlos Rocha', 'Inês Matos'];
        $genders = ['male', 'female', 'male', 'female', 'male', 'female', 'male', 'female'];

        foreach ($names as $index => $name) {
            $playersA[] = Player::create([
                'team_id' => $teamA->id,
                'name' => $name,
                'gender' => $genders[$index],
                'position' => $positions[$index],
               
            ]);
        }

        // Criar Jogadores para a equipa B
        $playersB = [];
        $namesB = ['Sergio Ramos', 'Clara Diaz', 'Fernando López', 'Isabel García', 'David Martín', 'Elena Torres', 'Alberto Ruiz', 'Marta Gómez'];

        foreach ($namesB as $index => $name) {
            $playersB[] = Player::create([
                'team_id' => $teamB->id,
                'name' => $name,
                'gender' => $genders[$index],
                'position' => $positions[$index],
                
            ]);
        }

        // Criar um jogo
        $game = Game::create([
            'team_a_id' => $teamA->id,
            'team_b_id' => $teamB->id,
            'date' => now()->addDays(1)->format('Y-m-d H:i:s'), // Define um datetime válido para amanhã
    'location' => 'Lisboa, Portugal',
          
        ]);

        // Simulação de eventos do jogo
        $eventTypes = ['goal', 'assist', 'missed_pass', 'defense', 'rebound', 'foul', 'substitution'];
        $possessions = range(1, 5);
        $times = ['00:30', '02:15', '05:42', '07:10', '10:20', '15:00', '20:45'];

        foreach ($times as $index => $time) {
            $player = $playersA[array_rand($playersA)];
            $action = Action::where('code', array_rand(['G', 'A', 'MP', 'D', 'RG', 'F', 'S']))->first();
            $possession = $possessions[array_rand($possessions)];

            Stat::create([
                'game_id' => $game->id,
                'player_id' => $player->id,
                'action_id' => $action->id,
                'success' => rand(0, 1),
                'event_type' => $eventTypes[array_rand($eventTypes)],
                'possession_id' => $possession,
                'possession_type' => rand(0, 1) ? 'attack' : 'defense',
                'description' => "Jogada de {$player->name}",
                'time' => $time
            ]);
        }

        echo "✅ Jogo e estatísticas populadas com sucesso!";
    }
}
