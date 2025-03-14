<?php

use App\Http\Controllers\TeamAPIController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::apiResource('/teams', TeamAPIController::class);

Route::apiResource('/games', GameAPIController::class);
