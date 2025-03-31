<?php

namespace App\Http\Controllers;

use App\Models\Stat;
use Illuminate\Http\Request;
use App\Models\Event;

class StatController extends Controller
{

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $stats = Stat::with(['player', 'action', 'event'])->get();
        return response()->json($stats);
    }

    /**
     * Store a newly created resource in storage.
     */

     public function store(Request $request)
     {
         $validated = $request->validate([
             'game_id' => 'required|exists:games,id',
             'player_id' => 'nullable|exists:players,id',
             'action_id' => 'required|exists:actions,id',
             'success' => 'nullable|boolean',
             'event_id' => 'nullable|exists:events,id',
             'description' => 'nullable|string',
             'time' => 'nullable|string',
         ]);
         
       
         $eventId = $request->input('event_id');
         if (!$eventId) {
             $activeEvent = Event::where('game_id', $request->input('game_id'))
                                 ->whereNull('end_time')
                                 ->latest()
                                 ->first();
             
             if ($activeEvent) {
                 $eventId = $activeEvent->id;
             }
         }
         
         // Create the stat
         $stat = Stat::create([
             'game_id' => $request->input('game_id'),
             'player_id' => $request->input('player_id'),
             'action_id' => $request->input('action_id'),
             'success' => $request->input('success'),
             'event_id' => $eventId,
             'description' => $request->input('description'),
             'time' => $request->input('time'),
         ]);
         
         return response()->json([
             'success' => true,
             'message' => 'Stat created successfully',
             'event' => $stat
         ]);
        }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $stat = Stat::with(['player', 'action', 'event'])->findOrFail($id);
        return response()->json($stat);
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


        try{

            
            // Reload relationships
            $stat->load(['player', 'action', 'event']);
            
            return response()->json([
                'message' => 'Stat updated successfully',
                'event' => $stat
            ]);
        }catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating stat',
                'error' => $e->getMessage()
            ], 500);
        }
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

