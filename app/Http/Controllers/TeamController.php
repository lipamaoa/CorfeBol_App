<?php

namespace App\Http\Controllers;

use App\Models\Team;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TeamController extends Controller
{
    public function show()
    {
        return Inertia::render('xx', ['team' => Team::all()]);
    }

    public function findById($id)
    {
        return Inertia::render('xx', ['teamId' => Team::findOrFail($id)]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|min:1|max:255',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg'
        ]);

        $photo = null;
        if ($request->hasFile('photo')) {
            $photo = Storage::putFile('teamPhotos', $request->photo);
        }

        Team::create([
            'name' => $request->name,
            'photo' => $photo
        ]);

        return redirect()->route('xx')->with('message', 'xx');
    }

    public function update(Request $request, $id)
    {
        $team = Team::findOrFail($id);

        $request->validate([
            'name' => 'required|string|min:1|max:255',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg'
        ]);

        // Se há novo nome, atualizar
        if ($request->has('name')) $team->name = $request->name;

        // Se há nova foto, atualizar
        if ($request->hasFile('photo')) {
            if ($team->photo) Storage::delete($team->photo);

            $team->photo = Storage::putFile('teamPhotos', $request->photo);
        }

        $team->save();

        return redirect()->route('xx')->with('message', 'xx');
    }

    public function delete($id)
    {
        $team = Team::findOrFail($id);

        // Apagamos foto
        if ($team->photo) Storage::delete($team->photo);

        $team->delete();

        return redirect()->route('xx')->with('message', 'xx');
    }
}
