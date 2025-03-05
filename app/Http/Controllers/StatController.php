<?php

namespace App\Http\Controllers;

use App\Models\Stat;
use Inertia\Inertia;
use Illuminate\Http\Request;

class StatController extends Controller
{
    public function show()
    {
        return Inertia::render('xx', ['action' => Stat::all()]);
    }

    public function findById($id)
    {
        return Inertia::render('xx', ['actionId' => Stat::findOrFail($id)]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'game_id' => 'required',
            'player_id' => 'required',
            'action_id' => 'required',
            'success' => 'nullable|boolean',
            'event_type' => 'required|string|max:50'
        ]);

        Stat::create([$request->all()]);

        return redirect()->route('xx')->with('message', 'xx');
    }

    public function update(Request $request, $id)
    {
        $stat = Stat::findOrFail($id);

        $request->validate([
            'game_id' => 'required',
            'player_id' => 'required',
            'action_id' => 'required',
            'success' => 'nullable|boolean',
            'event_type' => 'required|string|max:50'
        ]);

        if ($request->has('game_id')) $stat->game_id = $request->game_id;
        if ($request->has('player_id')) $stat->player_id = $request->player_id;
        if ($request->has('action_id')) $stat->action_id = $request->action_id;
        if ($request->has('success')) $stat->success = $request->success;
        if ($request->has('event_type')) $stat->event_type = $request->event_type;

        $stat->save();

        return redirect()->route('xx')->with('message', 'xx');
    }

    public function delete($id)
    {
        $stat = Stat::findOrFail($id);

        $stat->delete();

        return redirect()->route('xx')->with('message', 'xx');
    }
}
