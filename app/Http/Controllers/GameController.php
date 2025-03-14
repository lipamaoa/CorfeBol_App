<?php

namespace App\Http\Controllers;

use App\Models\Game;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class GameController extends Controller
{

    public function create()
    {
        // $games = Game::with(['teamA', 'teamB'])->get();

        return Inertia::render('games.create');
    }


    public function show(Request $request)
    {
        // TeamController
        $teamController = app(TeamController::class);
        $teams = $teamController->show();

        // Games
        $games = Game::with(['teamA', 'teamB'])->get();

        return Inertia::render('games/create', ['games' => $games, 'teams' => $teams]);
    }

    public function findById($id)
    {
        $games = Game::with(['teamA', 'teamB'])->findOrFail($id);

        return Inertia::render('games/create', ['gameId' => $games]);
    }

    public function store(Request $request)
    {

        // dd($request);
        $request->validate([
            'team_a_id' => 'required|exists:teams,id',
            'team_b_id' => 'required|exists:teams,id',
            'date' => 'required|date',
            'location' => 'nullable|string|max:255',
            'status' => 'string|max:50',
        ]);


        Game::create([
            'team_a_id' => $request->team_a_id,
            'team_b_id' => $request->team_b_id,
            'date' => $request->date,
            'location' => $request->location
        ]);

        return redirect()->back()->with('message', 'Game added to schedule!');
    }

    public function update(Request $request, $id)
    {
        Log::info('Game update request data:', $request->all());

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

        return redirect()->route('games.create')->with('message', 'Game updated!');
    }

    public function delete($id)
    {
        $game = Game::findOrFail($id);

        $game->delete();

        return redirect()->route('games.create')->with('message', 'xx');
    }
}
