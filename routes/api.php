<?php

use App\Http\Controllers\PlayerAPIController;
use App\Http\Controllers\TeamAPIController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::apiResource('/teams', TeamAPIController::class);
Route::apiResource('/players', PlayerAPIController::class);
