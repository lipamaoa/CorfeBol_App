<?php

namespace App\Http\Controllers;

use App\Models\GamePlayer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class GamePlayerController extends Controller
{
    public function updatePosition(Request $request)
    {
        $request->validate([
            'game_id' => 'required|exists:games,id',
            'player_id' => 'required|exists:players,id',
            'initial_position' => 'required|in:attack,defense,bench',
        ]);

        Log::debug($request);

        try {
            $updated = GamePlayer::where('game_id', $request->game_id)
                ->where('player_id', $request->player_id)
                ->update([
                    'initial_position' => $request->initial_position,
                ]);

            if (!$updated) {
                $gamePlayer = GamePlayer::create([
                    'game_id' => $request->game_id,
                    'player_id' => $request->player_id,
                    'initial_position' => $request->initial_position,
                ]);
            } else {
                $gamePlayer = GamePlayer::where('game_id', $request->game_id)
                    ->where('player_id', $request->player_id)
                    ->first();
            }

            Log::info('Player position updated', [
                'game_id' => $request->game_id,
                'player_id' => $request->player_id,
                'initial_position' => $request->initial_position
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Player position updated successfully',
                'data' => $gamePlayer
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update player position', [
                'error' => $e->getMessage(),
                'game_id' => $request->game_id,
                'player_id' => $request->player_id,
                'initial_position' => $request->initial_position
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update player position: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getGamePlayers($gameId)
    {
        try {
            $gamePlayers = GamePlayer::where('game_id', $gameId)
                ->with('player')
                ->get();

            $players = $gamePlayers->map(function ($gamePlayer) {
                $player = $gamePlayer->player;
                $player->position = $gamePlayer->initial_position;

                return $player;
            });

            Log::info('Fetched game players', [
                'game_id' => $gameId,
                'players' => $players
            ]);

            return response()->json($players);
        } catch (\Exception $e) {
            Log::error('Failed to fetch game players', [
                'error' => $e->getMessage(),
                'game_id' => $gameId
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch game players: ' . $e->getMessage()
            ], 500);
        }
    }
}
