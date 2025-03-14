<?php

namespace App\Http\Controllers;

use App\Models\Game;
use Illuminate\Http\Request;

class GameApiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $games = Game::with(['teamA', 'teamB'])->get();
        return response()->json($games);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'team_a_id' => 'required|exists:teams,id',
            'team_b_id' => 'required|exists:teams,id',
            'date' => 'required|date',
            'location' => 'nullable|string|max:255',
        ]);

        // dd($request);
        Game::create([
            'team_a_id' => $request->team_a_id,
            'team_b_id' => $request->team_b_id,
            'date' => $request->date,
            'location' => $request->location
        ]);

        $games = Game::with(['teamA', 'teamB'])->get();

        return response()->json($games, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        // TeamController
        $teamController = app(TeamController::class);
        $teams = $teamController->show();

        $games = Game::with(['teamA', 'teamB'])->findOrFail($id);

        return response()->json($games);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
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

        return response()->json($game);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $game = Game::findOrFail($id);

        $game->delete();

        return response()->json(null);
    }
}
