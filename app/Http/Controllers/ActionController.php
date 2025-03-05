<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Action;
use Illuminate\Http\Request;

class ActionController extends Controller
{
    public function show()
    {
        return Inertia::render('xx', ['action' => Action::all()]);
    }

    public function findById($id)
    {
        return Inertia::render('xx', ['actionId' => Action::findOrFail($id)]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'code' => 'required|string|max:10',
            'description' => 'nullable|string|max:255'
        ]);

        Action::create([$request->all()]);

        return redirect()->route('xx')->with('message', 'xx');
    }

    public function update(Request $request, $id)
    {
        $action = Action::findOrFail($id);

        $request->validate([
            'code' => 'required|string|max:10',
            'description' => 'nullable|string|max:255'
        ]);

        if ($request->has('code')) $action->code = $request->code;
        if ($request->has('name')) $action->description = $request->description;

        $action->save();

        return redirect()->route('xx')->with('message', 'xx');
    }

    public function delete($id)
    {
        $action = Action::findOrFail($id);

        $action->delete();

        return redirect()->route('xx')->with('message', 'xx');
    }
}
