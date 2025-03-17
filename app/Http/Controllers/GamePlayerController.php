<?php

namespace App\Http\Controllers;

use App\Models\GamePlayer;
use Illuminate\Http\Request;

class GamePlayerController extends Controller
{
    public function updatePosition(Request $request)
    {
        $validated = $request->validate([
            'game_id' => 'required|exists:games,id',
            'player_id' => 'required|exists:players,id',
            'position' => 'required|in:attack,defense,bench',
            'position_index' => 'nullable|integer',
        ]);
        
        // First, check if this player already has a position in this game
        $gamePlayer = GamePlayer::where('game_id', $validated['game_id'])
                               ->where('player_id', $validated['player_id'])
                               ->first();
        
        if ($validated['position'] === 'bench') {
            // If moving to bench, remove from game_players
            if ($gamePlayer) {
                $gamePlayer->delete();
            }
            return response()->json(['message' => 'Player moved to bench']);
        }
        
        if ($gamePlayer) {
            // Update existing position
            $gamePlayer->update([
                'position' => $validated['position'],
                'position_index' => $validated['position_index'] ?? 0,
            ]);
        } else {
            // Create new position
            GamePlayer::create([
                'game_id' => $validated['game_id'],
                'player_id' => $validated['player_id'],
                'position' => $validated['position'],
                'position_index' => $validated['position_index'] ?? 0,
            ]);
        }
        
        return response()->json(['message' => 'Player position updated']);
    }
}

