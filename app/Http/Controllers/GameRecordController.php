<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\Player;
use App\Models\Action;
use App\Models\Stat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class GameRecordController extends Controller
{
    public function show(Request $request)
    {
        $gameId = $request->query('game');
        
        // Check if game ID is provided
        if (!$gameId) {
            // Option 1: Get the most recent game
            $game = Game::with(['teamA', 'teamB'])
                ->orderBy('date', 'desc')
                ->first();
                
            // If no games exist at all, redirect to create game page
            if (!$game) {
                return redirect()->route('games.create')
                    ->with('message', 'No games found. Please create a game first.');
            }
            
            // Redirect to the same page but with the game ID
            return redirect()->route('games.record', ['game' => $game->id]);
        }
        
        try {
            // Get the game with related teams
            $game = Game::with(['teamA', 'teamB'])
                ->findOrFail($gameId);
            
            // Get all players from both teams
            $teamAPlayers = Player::where('team_id', $game->team_a_id)->get();
            $teamBPlayers = Player::where('team_id', $game->team_b_id)->get();
            
            // Combine players from both teams
            $players = $teamAPlayers->concat($teamBPlayers);
            
            // Get existing stats for this game
            $stats = Stat::with(['player', 'action'])
                ->where('game_id', $gameId)
                ->orderBy('created_at', 'desc')
                ->get();
            
            // Get all action codes
            $actions = Action::all();
            
            return Inertia::render('games/record', [
                'game' => $game,
                'players' => $players,
                'stats' => $stats,
                'actions' => $actions
            ]);
        } catch (\Exception $e) {
            // Log the error
            Log::error('Error loading game record page', [
                'game_id' => $gameId,
                'error' => $e->getMessage()
            ]);
            
            // Redirect to games list with error message
            return redirect()->route('games.index')
                ->with('error', 'The requested game could not be found. Please select another game.');
        }
    }
    
    public function storeStat(Request $request)
    {
        // Log the entire request for debugging
        Log::info('Received stat request', [
            'all' => $request->all(),
            'headers' => $request->headers->all(),
            'method' => $request->method(),
            'path' => $request->path(),
        ]);
        
        try {
            // Validate the request
            $validated = $request->validate([
                'game_id' => 'required|exists:games,id',
                'player_id' => 'nullable|exists:players,id',
                'action_id' => 'required|exists:actions,id',
                'success' => 'nullable|boolean',
                'event_type' => 'required|string|max:50',
                'possession_id' => 'nullable|integer',
                'possession_type' => 'nullable|string|max:50',
                'description' => 'nullable|string',
                'time' => 'required|string',
            ]);
            
            Log::info('Validated data', $validated);
            
            // Use a database transaction to ensure data integrity
            DB::beginTransaction();
            
            // Create the stat record
            $stat = new Stat();
            $stat->game_id = $validated['game_id'];
            $stat->player_id = $validated['player_id'];
            $stat->action_id = $validated['action_id'];
            $stat->success = $validated['success'];
            $stat->event_type = $validated['event_type'];
            $stat->possession_id = $validated['possession_id'] ?? null;
            $stat->possession_type = $validated['possession_type'] ?? null;
            $stat->description = $validated['description'] ?? null;
            $stat->time = $validated['time'];
            
            // Save the record
            $saved = $stat->save();
            
            if (!$saved) {
                throw new \Exception('Failed to save stat record');
            }
            
            // Commit the transaction
            DB::commit();
            
            // Reload the model with relationships
            $stat = Stat::with(['player', 'action'])->find($stat->id);
            
            Log::info('Stat saved successfully', ['id' => $stat->id]);
            
            return response()->json($stat);
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            Log::error('Validation error', ['errors' => $e->errors()]);
            return response()->json(['error' => 'Validation failed', 'details' => $e->errors()], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating stat', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }


     /**
     * Update an existing stat record
     */
    public function updateStat(Request $request, $id)
    {
        try {
            // Log the request
            Log::info('Updating stat', [
                'id' => $id,
                'data' => $request->all()
            ]);
            
            // Find the stat
            $stat = Stat::findOrFail($id);
            
            // Validate the request
            $validated = $request->validate([
                'action_id' => 'required|exists:actions,id',
                'success' => 'nullable|boolean',
                'description' => 'nullable|string',
            ]);
            
            // Update the stat
            $stat->action_id = $validated['action_id'];
            $stat->success = $validated['success'];
            $stat->description = $validated['description'] ?? null;
            
            // Save the changes
            $stat->save();
            
            // Reload the model with relationships
            $stat = Stat::with(['player', 'action'])->find($stat->id);
            
            Log::info('Stat updated successfully', ['id' => $stat->id]);
            
            return response()->json($stat);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('Stat not found', ['id' => $id]);
            return response()->json(['error' => 'Stat not found'], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error', ['errors' => $e->errors()]);
            return response()->json(['error' => 'Validation failed', 'details' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Error updating stat', [
                'id' => $id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete a stat record
     */
    public function deleteStat($id)
    {
        try {
            // Log the request
            Log::info('Deleting stat', ['id' => $id]);
            
            // Find the stat
            $stat = Stat::findOrFail($id);
            dd($stat);
            
            // Delete the stat
            $stat->delete();
            
            Log::info('Stat deleted successfully', ['id' => $id]);
            
            return response()->json(['success' => true]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('Stat not found', ['id' => $id]);
            return response()->json(['error' => 'Stat not found'], 404);
        } catch (\Exception $e) {
            Log::error('Error deleting stat', [
                'id' => $id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    
    // Add a test method to directly insert a stat
    public function testInsertStat()
    {
        try {
            $stat = new Stat();
            $stat->game_id = 1; // Adjust to a valid game ID
            $stat->player_id = 1; // Adjust to a valid player ID
            $stat->action_id = 1; // Adjust to a valid action ID
            $stat->success = true;
            $stat->event_type = 'test';
            $stat->time = '00:00';
            $stat->description = 'Test stat';
            
            $saved = $stat->save();
            
            return response()->json([
                'success' => $saved,
                'stat' => $stat
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

