<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;

class EventAPIController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $events = Event::with('player')->get();
        return response()->json($events);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'player_id' => 'required|exists:players,id',
        ]);

        try {
            $event = Event::create($validated);

            // Load relationship
            $event->load('player');

            return response()->json([
                'message' => 'Event created successfully',
                'event' => $event
            ]);
        } catch (\Exception $e) {
            // Handle any error during event creation
            return response()->json([
                'success' => false,
                'message' => 'Error creating event: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $event = Event::with('player')->findOrFail($id);
        return response()->json($event);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $event = Event::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'player_id' => 'required|exists:players,id',
        ]);

        try {
            $event->update($validated);

            // Reload relationship
            $event->load('player');

            return response()->json([
                'message' => 'Event updated successfully',
                'event' => $event
            ]);
        } catch (\Exception $e) {
            // Handle any error during event update
            return response()->json([
                'success' => false,
                'message' => 'Error updating event: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $event = Event::findOrFail($id);

        try {
            $event->delete();

            return response()->json([
                'message' => 'Event deleted successfully'
            ]);
        } catch (\Exception $e) {
            // Handle any error during event deletion
            return response()->json([
                'success' => false,
                'message' => 'Error deleting event: ' . $e->getMessage()
            ], 500);
        }
    }


    /**
     * Start a new game phase (attack or defense)
     */
    public function startPhase(Request $request)
    {
        $validated = $request->validate([
            'game_id' => 'required|exists:games,id',
            'name' => 'required|in:attack,defense',
            'start_time' => 'required|string',
        ]);

        Log::debug($validated);

        // End any active phases for this game
        $this->endActivePhases($validated['game_id']);

        try {
            $event = Event::create([
                'name' => ucfirst($validated['name']) . ' phase',
                'game_id' => $validated['game_id'],
                'name' => $validated['name'],
                'start_time' => $validated['start_time'],
            ]);

            return response()->json([
                'success' => true,
                'message' => ucfirst($validated['name']) . ' phase started',
                'event' => $event
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error starting phase: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * End a game phase
     */
    public function endPhase(Request $request, $id)
    {
        $event = Event::findOrFail($id);

        $validated = $request->validate([
            'end_time' => 'required|string',
        ]);

        try {
            $event->update([
                'end_time' => $validated['end_time']
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Phase ended',
                'event' => $event
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error ending phase: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get the current active phase for a game
     */
    public function getCurrentPhase($gameId)
    {
        $event = Event::where('game_id', $gameId)
            ->whereNull('end_time')
            ->latest()
            ->first();

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'No active phase found'
            ]);
        }

        return response()->json([
            'success' => true,
            'event' => $event
        ]);
    }

    /**
     * Get all phases for a game
     */
    public function getGamePhases($gameId)
    {
        $events = Event::where('game_id', $gameId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($events);
    }

    /**
     * End any active phases for a game
     */
    private function endActivePhases($gameId)
    {
        $activeEvents = Event::where('game_id', $gameId)
            ->whereNull('end_time')
            ->get();

        foreach ($activeEvents as $event) {
            $event->update([
                'end_time' => now()->format('H:i:s')
            ]);
        }
    }
}
