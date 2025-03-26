<?php

namespace App\Http\Controllers;

use App\Models\Stat;
use Illuminate\Http\Request;

class StatController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'game_id' => 'required|exists:games,id',
            'player_id' => 'nullable|exists:players,id',
            'action_id' => 'required|exists:actions,id',
            'success' => 'nullable|boolean',
            'event_id' => 'required|integer',
            'description' => 'nullable|string',
            'time' => 'required|string',
        ]);

   
        
        $stat = Stat::create($validated);
        
        // Load relationships
        $stat->load(['player', 'action']);
        
        return response()->json([
            'message' => 'Stat recorded successfully',
            'event' => $stat
        ]);
    }
    
    public function update(Request $request, $id)
    {
        $stat = Stat::findOrFail($id);
        
        $validated = $request->validate([
            'player_id' => 'nullable|exists:players,id',
            'action_id' => 'required|exists:actions,id',
            'event_id' => 'required|integer',
            'success' => 'nullable|boolean',
            'description' => 'nullable|string',
            'time' => 'required|string',
        ]);
        
        $stat->update($validated);
        
        // Reload relationships
        $stat->load(['player', 'action']);
        
        return response()->json([
            'message' => 'Stat updated successfully',
            'event' => $stat
        ]);
    }
    
    public function destroy($id)
    {
        $stat = Stat::findOrFail($id);
        $stat->delete();
        
        return response()->json([
            'message' => 'Stat deleted successfully'
        ]);
    }
    
    public function getGameStats($gameId)
    {
        $stats = Stat::where('game_id', $gameId)
            ->with(['player', 'action'])
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($stats);
    }
}

