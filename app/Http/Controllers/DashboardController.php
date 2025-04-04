<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\Player;
use App\Models\Stat;
use App\Models\Team;
use App\Models\Action;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function getStats()
    {
        
        $totalTeams = Team::count();
        $totalPlayers = Player::count();
        $totalGames = Game::count();

        $goalsByType = $this->calculateGoalsByType();

        $goalsByPeriod = $this->calculateGoalsByPeriod();

      
        $goalsByGender = $this->calculateGoalsByGender();

      
        $gamesByMonth = $this->calculateGamesByMonth();

        return response()->json([
            'total_teams' => $totalTeams,
            'total_players' => $totalPlayers,
            'total_games' => $totalGames,
            'goals_by_type' => $goalsByType,
            'goals_by_period' => $goalsByPeriod,
            'goals_by_gender' => $goalsByGender,
            'games_by_month' => $gamesByMonth,
        ]);
    }

    /**
     * Calculate goals by shot type (LC, LM, LL, L, Pe)
     */
    private function calculateGoalsByType()
    {
      
        $shotActionCodes = ['LC', 'LM', 'LL', 'L', 'Pe'];
        
        
        $shotStats = DB::table('stats')
            ->join('actions', 'stats.action_id', '=', 'actions.id')
            ->whereIn('actions.code', $shotActionCodes)
            ->where('stats.success', true)
            ->select('actions.code', 'actions.description', DB::raw('count(*) as count'))
            ->groupBy('actions.code', 'actions.description')
            ->orderBy('count', 'desc')
            ->get();

      
        $result = [];
        foreach ($shotStats as $stat) {
            $result[] = [
                'name' => $stat->description ?: $stat->code,
                'value' => $stat->count,
                'code' => $stat->code
            ];
        }

        return $result;
    }

    /**
     * Calculate goals by period
     */
    private function calculateGoalsByPeriod()
    {
     
        $goalsByPeriod = DB::table('stats')
            ->join('actions', 'stats.action_id', '=', 'actions.id')
            ->where('actions.code', 'G')
            ->where('stats.success', true)
            ->select(DB::raw('SUBSTRING_INDEX(stats.time, ":", 1) as period'), DB::raw('count(*) as count'))
            ->groupBy('period')
            ->orderBy(DB::raw('CAST(period as UNSIGNED)'))
            ->get();

        
        $result = [];
        foreach ($goalsByPeriod as $period) {
            $result[] = [
                'name' => "Period " . $period->period,
                'value' => $period->count
            ];
        }

        return $result;
    }

    /**
     * Calculate goals by gender
     */
    private function calculateGoalsByGender()
    {
        
        $goalStats = DB::table('stats')
            ->join('actions', 'stats.action_id', '=', 'actions.id')
            ->join('players', 'stats.player_id', '=', 'players.id')
            ->where('actions.code', 'G') // Goal action code
            ->where('stats.success', true)
            ->select('players.gender', DB::raw('count(*) as count'))
            ->groupBy('players.gender')
            ->get();

       
        $maleGoals = $goalStats->where('gender', 'male')->first()->count ?? 0;
        $femaleGoals = $goalStats->where('gender', 'female')->first()->count ?? 0;

        return [
            'male' => $maleGoals,
            'female' => $femaleGoals,
        ];
    }

    /**
     * Calculate games by month for the current year
     */
    private function calculateGamesByMonth()
    {
      
        $currentYear = Carbon::now()->year;
        
        
        $games = Game::whereYear('date', $currentYear)
            ->select(DB::raw('MONTH(date) as month'), DB::raw('count(*) as count'))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        
        $months = [
            1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr', 5 => 'May', 6 => 'Jun',
            7 => 'Jul', 8 => 'Aug', 9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Dec'
        ];

        $result = [];
        foreach ($months as $monthNum => $monthName) {
            $count = $games->where('month', $monthNum)->first()->count ?? 0;
            $result[] = [
                'month' => $monthName,
                'count' => $count,
            ];
        }

        return $result;
    }

    /**
     * Get total goals for summary stats
     */
    private function getTotalGoals()
    {
        return DB::table('stats')
            ->join('actions', 'stats.action_id', '=', 'actions.id')
            ->where('actions.code', 'G')
            ->where('stats.success', true)
            ->count();
    }

    /**
     * Get detailed stats for a specific game
     */
    public function getGameStats($gameId)
    {
        $game = Game::find($gameId);
        if (!$game) {
            return response()->json(['error' => 'Game not found'], 404);
        }

     
        $stats = Stat::where('game_id', $gameId)->get();
        
  
        $players = Player::whereHas('stats', function($query) use ($gameId) {
            $query->where('game_id', $gameId);
        })->get();
        
     
        $actions = Action::all();

        $goalsByType = $this->calculateGameGoalsByType($gameId);
        $goalsByGender = $this->calculateGameGoalsByGender($gameId);
        $goalsByPeriod = $this->calculateGameGoalsByPeriod($gameId);

        return response()->json([
            'game' => $game,
            'stats' => [
                'total_goals' => $this->getGameTotalGoals($gameId),
                'goals_by_type' => $goalsByType,
                'goals_by_gender' => $goalsByGender,
                'goals_by_period' => $goalsByPeriod
            ],
            'players' => $players,
            'actions' => $actions
        ]);
    }

    /**
     * Calculate goals by type for a specific game
     */
    private function calculateGameGoalsByType($gameId)
    {
        
        $shotActionCodes = ['LC', 'LM', 'LL', 'L', 'Pe'];
        
        
        $shotStats = DB::table('stats')
            ->join('actions', 'stats.action_id', '=', 'actions.id')
            ->where('stats.game_id', $gameId)
            ->whereIn('actions.code', $shotActionCodes)
            ->where('stats.success', true)
            ->select('actions.code', 'actions.description', DB::raw('count(*) as count'))
            ->groupBy('actions.code', 'actions.description')
            ->orderBy('count', 'desc')
            ->get();

        
        $result = [];
        foreach ($shotStats as $stat) {
            $result[] = [
                'name' => $stat->description ?: $stat->code,
                'value' => $stat->count,
                'code' => $stat->code
            ];
        }

        return $result;
    }

    /**
     * Calculate goals by gender for a specific game
     */
    private function calculateGameGoalsByGender($gameId)
    {
        
        $goalStats = DB::table('stats')
            ->join('actions', 'stats.action_id', '=', 'actions.id')
            ->join('players', 'stats.player_id', '=', 'players.id')
            ->where('stats.game_id', $gameId)
            ->where('actions.code', 'G')
            ->where('stats.success', true)
            ->select('players.gender', DB::raw('count(*) as count'))
            ->groupBy('players.gender')
            ->get();

     
        $maleGoals = $goalStats->where('gender', 'male')->first()->count ?? 0;
        $femaleGoals = $goalStats->where('gender', 'female')->first()->count ?? 0;

        return [
            'male' => $maleGoals,
            'female' => $femaleGoals,
        ];
    }

    /**
     * Calculate goals by period for a specific game
     */
    private function calculateGameGoalsByPeriod($gameId)
    {
        
        $goalsByPeriod = DB::table('stats')
            ->join('actions', 'stats.action_id', '=', 'actions.id')
            ->where('stats.game_id', $gameId)
            ->where('actions.code', 'G')
            ->where('stats.success', true)
            ->select(DB::raw('SUBSTRING_INDEX(stats.time, ":", 1) as period'), DB::raw('count(*) as count'))
            ->groupBy('period')
            ->orderBy(DB::raw('CAST(period as UNSIGNED)'))
            ->get();

        
        $result = [];
        foreach ($goalsByPeriod as $period) {
            $result[] = [
                'name' => "Period " . $period->period,
                'value' => $period->count
            ];
        }

        return $result;
    }

    /**
     * Get total goals for a specific game
     */
    private function getGameTotalGoals($gameId)
    {
        return DB::table('stats')
            ->join('actions', 'stats.action_id', '=', 'actions.id')
            ->where('stats.game_id', $gameId)
            ->where('actions.code', 'G')
            ->where('stats.success', true)
            ->count();
    }
}