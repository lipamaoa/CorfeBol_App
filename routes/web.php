<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use App\Http\Controllers\GameController;
use App\Http\Controllers\GameRecordController;
use App\Http\Controllers\StatController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\ActionController;
use App\Http\Controllers\PlayerController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;


Route::get('/', function () {
    return Inertia::render('welcome', [
        // 'canLogin' => Route::has('login'),
        // 'canRegister' => Route::has('register'),
        // 'laravelVersion' => Application::VERSION,
        // 'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'main'])->name('dashboard');

    // Route::prefix('teams')->controller(TeamController::class)->group(function () {
    //     Route::put('/{id}', 'update')->name('teams.update');
    //     Route::get('/{id}', 'findById')->name('teams.showid');
    //     Route::post('/', 'store')->name('teams.store');
    //     Route::delete('/{id}', 'delete')->name('teams.delete');
    // });

    // Route::prefix('players')->controller(PlayerController::class)->group(function () {
    //     Route::put('/{id}', 'update')->name('players.update');
    //     Route::get('/{id}', 'findById')->name('players.showid');
    //     Route::post('/', 'store')->name('players.store');
    //     Route::delete('/{id}', 'delete')->name('players.delete');
    // });

    // Route::get('/games/create', function () {
    //     return Inertia::render('games/create');
    // })->name('games.create');
    Route::prefix('games')->controller(GameController::class)->group(function () {
        Route::get('/create', 'show')->name('games.create');
        Route::get('/{id}', 'findById')->name('games.showid');
        Route::post('/', 'store')->name('games.store');
        Route::put('/{id}', 'update')->name('games.update');
        Route::delete('/{id}', 'delete')->name('games.delete');
    });


    // Game recording routes
    Route::get('/games', [GameRecordController::class, 'record'])->name('games.show');
    Route::get('/games/{id}/record', [GameRecordController::class, 'show'])->name('games.record');
    Route::post('/games/{id}/end', [GameRecordController::class, 'endGame'])->name('games.end');
});




// Route::middleware('auth')->group(function () {
//     Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
//     Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
//     Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
// });

/*
|--------------------------------------------------------------------------
| Routes CRUD Geral
|--------------------------------------------------------------------------
*/
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



require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
