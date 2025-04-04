<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\Player;
use App\Models\Action;
use App\Models\Stat;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class GameRecordController extends Controller
{
    public function show($id)
    {
        try {
            $game = Game::with(['teamA', 'teamB'])->findOrFail($id);

        
            $players = Player::where('team_id', $game->team_a_id)
                ->orWhere('team_id', $game->team_b_id)
                ->get();



           
            $actions = Action::all();

          
            $stats = Stat::with(['player', 'action'])
                ->where('game_id', $id)
                ->orderBy('created_at', 'desc')
                ->get();

           
            if ($game->score_team_a === null) {
                $game->score_team_a = 0;
            }

            if ($game->score_team_b === null) {
                $game->score_team_b = 0;
            }

            Log::info('Rendering game record page', [
                'game_id' => $id,
                'players_count' => $players->count(),
                'actions_count' => $actions->count(),
                'stats_count' => $stats->count(),
                'score_team_a' => $game->score_team_a,
                'score_team_b' => $game->score_team_b
            ]);

            return Inertia::render('games/record', [
                'game' => $game,
                'players' => $players,
                'actions' => $actions,
                'stats' => $stats
            ]);
        } catch (\Exception $e) {
            Log::error('Error rendering game record page', [
                'game_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('games.show')->with('error', 'Error loading game: ' . $e->getMessage());
        }
    }

    public function record(Request $request)
    {
        $status = $request->query('status', 'all');

        $query = Game::with(['teamA', 'teamB']);

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $games = $query->orderBy('date', 'desc')->get();

      
        foreach ($games as $game) {
            if (!$game->teamA || !$game->teamB) {
                Log::warning('Game with missing team relationship:', [
                    'game_id' => $game->id,
                    'team_a_id' => $game->team_a_id,
                    'team_b_id' => $game->team_b_id
                ]);
            }
        }

        return Inertia::render('games/index', [
            'games' => $games,
            'status' => $status
        ]);
    }




    public function endGame(Request $request, $id)
    {
        $game = Game::findOrFail($id);

        $validated = $request->validate([
            'score_team_a' => 'required|integer|min:0',
            'score_team_b' => 'required|integer|min:0',
            'ended_at' => 'required|date'
        ]);

        $game->update([
            'score_team_a' => $validated['score_team_a'],
            'score_team_b' => $validated['score_team_b'],
            'ended_at' => $validated['ended_at'],
            'status' => 'completed'
        ]);

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'game' => $game]);
        }

        return redirect()->route('dashboard')->with('success', 'Game ended successfully');
    }
}
