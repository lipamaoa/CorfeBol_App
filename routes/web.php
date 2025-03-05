<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GameController;
use App\Http\Controllers\StatController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\ActionController;
use App\Http\Controllers\PlayerController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

/*
|--------------------------------------------------------------------------
| Routes CRUD Geral
|--------------------------------------------------------------------------
*/

Route::prefix('teams')->controller(TeamController::class)->group(function () {
    Route::get('/', 'show')->name('teams.show');
    Route::get('/{id}', 'findById')->name('teams.showid');
    Route::post('/', 'store')->name('teams.store');
    Route::put('/{id}', 'update')->name('teams.update');
    Route::delete('/{id}', 'delete')->name('teams.delete');
});

Route::prefix('players')->controller(PlayerController::class)->group(function () {
    Route::get('/', 'show')->name('players.show');
    Route::get('/{id}', 'findById')->name('players.showid');
    Route::post('/', 'store')->name('players.store');
    Route::put('/{id}', 'update')->name('players.update');
    Route::delete('/{id}', 'delete')->name('players.delete');
});

Route::prefix('games')->controller(GameController::class)->group(function () {
    Route::get('/', 'show')->name('games.show');
    Route::get('/{id}', 'findById')->name('games.showid');
    Route::post('/', 'store')->name('games.store');
    Route::put('/{id}', 'update')->name('games.update');
    Route::delete('/{id}', 'delete')->name('games.delete');
});

Route::prefix('actions')->controller(ActionController::class)->group(function () {
    Route::get('/', 'show')->name('actions.show');
    Route::get('/{id}', 'findById')->name('actions.showid');
    Route::post('/', 'store')->name('actions.store');
    Route::put('/{id}', 'update')->name('actions.update');
    Route::delete('/{id}', 'delete')->name('actions.delete');
});

Route::prefix('stats')->controller(StatController::class)->group(function () {
    Route::get('/', 'show')->name('stats.show');
    Route::get('/{id}', 'findById')->name('stats.showid');
    Route::post('/', 'store')->name('stats.store');
    Route::put('/{id}', 'update')->name('stats.update');
    Route::delete('/{id}', 'delete')->name('stats.delete');
});
