<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use App\Http\Controllers\GameController;
use App\Http\Controllers\GameRecordController;
use App\Http\Controllers\StatController;
use App\Http\Controllers\ActionController;
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
    Route::get('/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('/games/create', function(){
        return Inertia::render('games/create');
    })->name('games.create');

    // Game recording routes
    Route::get('/games', [GameRecordController::class, 'record'])->name('games.show');
    Route::get('/games/{id}/record', [GameRecordController::class, 'show'])->name('games.record');
    Route::post('/games/{id}/end', [GameRecordController::class, 'endGame'])->name('games.end');
});



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
