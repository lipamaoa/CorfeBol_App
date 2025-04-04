<?php

namespace App\Http\Controllers;

use App\Models\Game;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\GamePlayer;
use App\Models\Player;
use App\Models\Action;
use App\Models\Stat;

class GameApiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $status = $request->query('status', 'all');
      
        
        $query = Game::with(['teamA', 'teamB']);
       
        

        if ($status !== 'all') {
            $query->where('status', $status);
        }
        
        $games = $query->orderBy('date', 'desc')->get();

         // Log the response for debugging
         Log::info('Games fetched with teams:', [
            'count' => $games->count(),
            'first_game' => $games->first() ? [
                'id' => $games->first()->id,
                'teamA' => $games->first()->teamA ? $games->first()->teamA->name : 'No Team A',
                'teamB' => $games->first()->teamB ? $games->first()->teamB->name : 'No Team B',
            ] : 'No games'
        ]);
      
        
        
        return response()->json($games);
        
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'team_a_id' => 'required|exists:teams,id',
            'team_b_id' => 'required|exists:teams,id',
            'date' => 'required|date',
            'location' => 'nullable|string|max:255',
        ]);

        $game= Game::create([
            'team_a_id' => $request->team_a_id,
            'team_b_id' => $request->team_b_id,
            'date' => $request->date,
            'location' => $request->location
        ]);


        // Get selected players from the form
        $selectedPlayers = Player::where('team_id', $request->team_a_id)->get();
        $playerPositions = $request->input('positions', []);

        Log::debug($selectedPlayers);


        // Insert into game_players table
        foreach ($selectedPlayers as $playerId) {
            GamePlayer::insert([
                'game_id' => $game->id,
                'player_id' => $playerId->id,
                'initial_position' => $playerPositions[$playerId->id] ?? 'bench',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return response()->json($game, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $games = Game::with(['teamA', 'teamB'])->findOrFail($id);

        return response()->json($games);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $game = Game::findOrFail($id);

        $request->validate([
            'team_a_id' => 'required|exists:teams,id',
            'team_b_id' => 'required|exists:teams,id',
            'date' => 'required|date', 
            'location' => 'nullable|string|max:255',
            'status' => 'string|max:50'
        ]);


      

       
        $game->team_a_id = $request->team_a_id;
        $game->team_b_id = $request->team_b_id;
        $game->date = $request->date;
        $game->location = $request->location ?? null;

        if ($request->has('status')) {
        $game->status = $request->status;
        }

        $game->save();

        return response()->json($game);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $game = Game::findOrFail($id);

        $game->delete();

        return response()->json(null);
    }



    public function endGame(Request $request, $id)
{
    $game = Game::findOrFail($id);
    
    $validated = $request->validate([
        'score_team_a' => 'required|integer|min:0',
        'score_team_b' => 'required|integer|min:0',
        'ended_at' => 'required|date',
    ]);
    
    $game->update([
        'score_team_a' => $validated['score_team_a'],
        'score_team_b' => $validated['score_team_b'],
        'status' => 'complete',
        'ended_at' => $validated['ended_at'],
    ]);
    
    return response()->json([
        'success' => true,
        'message' => 'Game ended successfully',
        'game' => $game
    ]);
}

/**
 * Get game report data including stats, players, and actions
 */
public function getGameReport($id)
{
    try {
        
        $game = Game::with(['teamA', 'teamB'])->findOrFail($id);
        
       
        $players = Player::where('team_id', $game->team_a_id)
            ->orWhere('team_id', $game->team_b_id)
            ->get();
        
       
        $actions = Action::all();
        
        
        $stats = Stat::where('game_id', $id)->get();
        
      
        Log::info("Game report data for game {$id}:", [
            'game' => $game->toArray(),
            'players_count' => $players->count(),
            'actions_count' => $actions->count(),
            'stats_count' => $stats->count()
        ]);
        
        return response()->json([
            'game' => $game,
            'players' => $players,
            'actions' => $actions,
            'stats' => $stats,
        ]);
    } catch (\Exception $e) {
        Log::error("Error generating game report for game {$id}: " . $e->getMessage());
        return response()->json([
            'error' => 'Failed to generate game report: ' . $e->getMessage()
        ], 500);
    }
}



}
