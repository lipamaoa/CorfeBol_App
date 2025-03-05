<?php

namespace App\Http\Controllers;

use App\Models\Game;
use Inertia\Inertia;
use Illuminate\Http\Request;

class GameController extends Controller
{
    public function show()
    {
        return Inertia::render('xx', ['game' => Game::with(['teamA', 'teamB'])->get()]);
    }

    public function findById($id)
    {
        return Inertia::render('xx', ['gameId' => Game::with(['teamA', 'teamB'])->findOrFail($id)]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'team_a_id' => 'required|exists:teams,id',
            'team_b_id' => 'required|exists:teams,id',
            'date' => 'required|date',
            'location' => 'nullable|string|max:255',
            'status' => 'string|max:50'
        ]);

        Game::create([$request->all()]);

        return redirect()->route('xx')->with('message', 'xx');
    }

    public function update(Request $request, $id)
    {
        $game = Game::findOrFail($id);

        $request->validate([
            'team_a_id' => 'required|exists:teams,id',
            'team_b_id' => 'required|exists:teams,id',
            'date' => 'required|date',
            'location' => 'nullable|string|max:255',
            'status' => 'string|max:50'
        ]);

        if ($request->has('team_a_id')) $game->team_a_id = $request->team_a_id;
        if ($request->has('team_b_id')) $game->team_b_id = $request->team_b_id;
        if ($request->has('date')) $game->date = $request->date;
        if ($request->has('location')) $game->location = $request->location;
        if ($request->has('status')) $game->status = $request->status;

        $game->save();

        return redirect()->route('xx')->with('message', 'xx');
    }

    public function delete($id)
    {
        $game = Game::findOrFail($id);

        $game->delete();

        return redirect()->route('xx')->with('message', 'xx');
    }
}
