<?php

namespace App\Http\Controllers;

use App\Models\Player;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PlayerAPIController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $players = Player::with('team')->get();
        return response()->json($players);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'team_id'  => 'required|exists:teams,id',
            'name'     => 'required|string|min:1|max:100',
            'gender'   => 'required|string|max:10',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg'
        ]);

        $photo = null;
        if ($request->hasFile('photo')) {
            $photo = Storage::putFile('playerPhotos', $request->photo);
        }

        Player::create([
            'team_id'  => $request->team_id,
            'name'     => $request->name,
            'gender'   => $request->gender,
            'photo'    => $photo
        ]);

        $players = Player::with('team')->get();
        return response()->json($players);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $player = Player::with('team')->findOrFail($id);
        return response()->json($player, 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $player = Player::findOrFail($id);

        $request->validate([
            'team_id'  => 'required|exists:teams,id',
            'name'     => 'required|string|min:1|max:100',
            'gender'   => 'required|string|max:10',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg'
        ]);

        if ($request->has('team_id')) $player->team_id = $request->team_id;
        if ($request->has('name')) $player->name = $request->name;
        if ($request->has('gender')) $player->gender = $request->gender;

        // Se há nova foto, atualizar
        if ($request->hasFile('photo')) {
            if ($player->photo) Storage::delete($player->photo);

            $player->photo = Storage::putFile('teamPhotos', $request->photo);
        }

        $player->save();
        return response()->json($player);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $player = Player::findOrFail($id);

        // Apagamos foto
        if ($player->photo) Storage::delete($player->photo);

        $player->delete();
        return response()->json(null, 204);

    }
}
