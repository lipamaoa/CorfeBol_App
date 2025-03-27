<?php

namespace App\Http\Controllers;

use App\Models\Event;
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
}
