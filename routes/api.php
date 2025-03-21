<?php

use App\Http\Controllers\PlayerAPIController;
use App\Http\Controllers\TeamAPIController;
use App\Http\Controllers\GameApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GamePlayerController;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::apiResource('/teams', TeamAPIController::class);
Route::apiResource('/players', PlayerAPIController::class);
Route::apiResource('/games', GameAPIController::class);

Route::post('/game-players/update-position', [GamePlayerController::class, 'updatePosition']);
Route::get('/games/{gameId}/players', [GamePlayerController::class, 'getGamePlayers']);