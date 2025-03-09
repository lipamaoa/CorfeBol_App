<?php

namespace App\Http\Controllers;

use App\Models\Stat;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Exception;

class StatController extends Controller
{
    public function show()
    {
        return Inertia::render('Statistics/Index', [
            'stats' => Stat::with(['player', 'action'])->get()
        ]);
    }

    public function findById($id)
    {
        return Inertia::render('Statistics/Show', [
            'stat' => Stat::with(['player', 'action'])->findOrFail($id)
        ]);
    }

    public function store(Request $request)
    {
        try {
            Log::info('Stat store request data:', $request->all());

            $validated = $request->validate([
                'game_id' => 'required|exists:games,id',
                'player_id' => 'nullable|exists:players,id',
                'action_id' => 'required|exists:actions,id',
                'success' => 'nullable|boolean',
                'event_type' => 'required|string|max:50',
                'possession_id' => 'nullable|integer',
                'possession_type' => 'nullable|string|max:50',
                'description' => 'nullable|string',
                'time' => 'required|string'
            ]);

            $stat = Stat::create($validated);
            $stat->load(['player', 'action']);

            return redirect()->route('statistics.index')->with('success', 'Stat recorded successfully');
        } catch (Exception $e) {
            Log::error('Error in StatController@store: ' . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request->all()
            ]);

            return redirect()->back()->with('error', 'Failed to save event: ' . $e->getMessage());
        }
    }

    public function update(Request $request, $id)
    {
        try {
            Log::info('Stat update request data:', $request->all());

            $stat = Stat::findOrFail($id);

            $validated = $request->validate([
                'game_id' => 'sometimes|required|exists:games,id',
                'player_id' => 'sometimes|nullable|exists:players,id',
                'action_id' => 'sometimes|required|exists:actions,id',
                'success' => 'sometimes|nullable|boolean',
                'event_type' => 'sometimes|required|string|max:50',
                'possession_id' => 'sometimes|nullable|integer',
                'possession_type' => 'sometimes|nullable|string|max:50',
                'description' => 'sometimes|nullable|string',
                'time' => 'sometimes|required|string'
            ]);

            $stat->update($validated);
            $stat->load(['player', 'action']);

            return redirect()->route('statistics.index')->with('success', 'Stat updated successfully');
        } catch (Exception $e) {
            Log::error('Error in StatController@update: ' . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request->all(),
                'id' => $id
            ]);

            return redirect()->back()->with('error', 'Failed to update event: ' . $e->getMessage());
        }
    }

    public function delete($id)
    {
        try {
            Log::info('Attempting to delete stat with ID: ' . $id);

            $stat = Stat::findOrFail($id);
            $stat->delete();
            Log::info('Stat deleted successfully');

            return redirect()->route('statistics.index')->with('success', 'Stat deleted successfully');
        } catch (Exception $e) {
            Log::error('Error in StatController@delete: ' . $e->getMessage(), [
                'exception' => $e,
                'id' => $id
            ]);

            return redirect()->back()->with('error', 'Failed to delete event: ' . $e->getMessage());
        }
    }
}
