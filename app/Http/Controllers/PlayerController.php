<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Player;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PlayerController extends Controller
{
    public function show()
    {
        $player = Player::with('team')->get();

        return Inertia::render('xx', ['player' => $player]);
    }

    public function findById($id)
    {
        return Inertia::render('xx', ['playerId' => Player::with('team')->findOrFail($id)]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'team_id'  => 'required|exists:teams,id',
            'name'     => 'required|string|min:1|max:100',
            'gender'   => 'required|string|max:10',
            'position' => 'required|string|max:10',
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
            'position' => $request->position,
            'photo'    => $photo
        ]);

        return redirect()->route('xx')->with('message', 'xx');
    }

    public function update(Request $request, $id)
    {
        $player = Player::findOrFail($id);

        $request->validate([
            'team_id'  => 'required|exists:teams,id',
            'name'     => 'required|string|min:1|max:100',
            'gender'   => 'required|string|max:10',
            'position' => 'required|string|max:10',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg'
        ]);

        if ($request->has('team_id')) $player->team_id = $request->team_id;
        if ($request->has('name')) $player->name = $request->name;
        if ($request->has('gender')) $player->gender = $request->gender;
        if ($request->has('position')) $player->position = $request->position;

        // Se há nova foto, atualizar
        if ($request->hasFile('photo')) {
            if ($player->photo) Storage::delete($player->photo);

            $player->photo = Storage::putFile('teamPhotos', $request->photo);
        }

        $player->save();

        return redirect()->route('xx')->with('message', 'xx');
    }

    public function delete($id)
    {
        $player = Player::findOrFail($id);

        // Apagamos foto
        if ($player->photo) Storage::delete($player->photo);

        $player->delete();

        return redirect()->route('xx')->with('message', 'xx');
    }
}
