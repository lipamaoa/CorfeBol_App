<?php

namespace App\Http\Controllers;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TeamAPIController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $teams = Team::all();
        return response()->json($teams);
    }

    /**
     * Store a newly created resource in storage.
     */
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

        $teams = Team::all();
        return response()->json($teams, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $team = Team::findOrFail($id);
        return response()->json($team);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $team = Team::findOrFail($id);

        $request->validate([
            'name' => 'required|string|min:1|max:255',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg',
        ]);

        if ($request->has('name')) {
            $team->name = $request->name;
        }

        if ($request->hasFile('photo')) {
            if ($team->photo) Storage::delete($team->photo);

            $team->photo = Storage::putFile('teamPhotos', $request->photo);
        }

        $team->save();

        return response()->json($team);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $team = Team::findOrFail($id);

        if ($team->photo) Storage::delete($team->photo);

        $team->delete();

        return response()->json(null, 204);
    }
}
