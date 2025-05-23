<?php

use App\Http\Controllers\EventAPIController;
use App\Http\Controllers\PlayerAPIController;
use App\Http\Controllers\TeamAPIController;
use App\Http\Controllers\GameApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GamePlayerController;
use App\Http\Controllers\StatController;
use App\Http\Controllers\DashboardController;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::apiResource('/teams', TeamAPIController::class);
Route::apiResource('/players', PlayerAPIController::class);
Route::apiResource('/games', GameAPIController::class);
Route::apiResource('/stats', StatController::class);
Route::apiResource('/events', EventAPIController::class);

Route::post('/game-players/update-position', [GamePlayerController::class, 'updatePosition']);
Route::get('/games/{gameId}/players', [GamePlayerController::class, 'getGamePlayers']);
Route::get('/games/{gameId}/stats', [StatController::class, 'getGameStats']);
Route::get('/games/latest/stats', [StatController::class, 'getLatestGameStats']);


// Event phase routes
Route::post('/events/start-phase', [EventAPIController::class, 'startPhase']);
Route::put('/events/{id}/end-phase', [EventAPIController::class, 'endPhase']);
Route::get('/games/{gameId}/current-phase', [EventAPIController::class, 'getCurrentPhase']);
Route::get('/events/game/{gameId}/phases', [EventAPIController::class, 'getGamePhases']);

// Add this route to your existing routes
Route::get('/games/{id}/report', [GameAPIController::class, 'getGameReport']);

Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);

