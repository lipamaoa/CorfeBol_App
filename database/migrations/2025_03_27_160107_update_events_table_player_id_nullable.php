<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            // Modificar a coluna player_id para ser nullable
            $table->unsignedBigInteger('player_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            // Reverter a mudança (embora isso possa causar erros se houver registros com player_id null)
            $table->unsignedBigInteger('player_id')->nullable(false)->change();
        });
    }
};