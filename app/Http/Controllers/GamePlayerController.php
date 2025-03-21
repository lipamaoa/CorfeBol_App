<?php

namespace App\Http\Controllers;

use App\Models\GamePlayer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class GamePlayerController extends Controller
{
    /**
     * Atualiza a posição de um jogador em um jogo.
     */
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

            Log::info('Posição do jogador atualizada', [
                'game_id' => $request->game_id,
                'player_id' => $request->player_id,
                'initial_position' => $request->initial_position
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Posição do jogador atualizada com sucesso',
                'data' => $gamePlayer
            ]);
        } catch (\Exception $e) {
            Log::error('Erro ao atualizar posição do jogador', [
                'error' => $e->getMessage(),
                'game_id' => $request->game_id,
                'player_id' => $request->player_id,
                'initial_position' => $request->initial_position
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar posição do jogador: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obter todos os jogadores de um jogo com suas posições
     */
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

            Log::info('Jogadores do jogo obtidos', [
                'game_id' => $gameId,
                'players' => $players
            ]);

            return response()->json($players);
        } catch (\Exception $e) {
            Log::error('Erro ao obter jogadores do jogo', [
                'error' => $e->getMessage(),
                'game_id' => $gameId
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erro ao obter jogadores do jogo: ' . $e->getMessage()
            ], 500);
        }
    }
}
