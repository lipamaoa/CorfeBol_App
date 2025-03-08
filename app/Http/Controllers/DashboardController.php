<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function main()
    {
        // TeamController
        $teamController = app(TeamController::class);
        $teams = $teamController->show();

        // PlayerController
        $playerController = app(PlayerController::class);
        $players = $playerController->show();

        return Inertia::render('dashboard', [
            'teams' => $teams,
            'players' => $players
        ]);
    }
}
