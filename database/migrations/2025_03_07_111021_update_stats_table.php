<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    public function up(): void
    {
        Schema::table('stats', function (Blueprint $table) {
            $table->integer('possession_id')->nullable()->after('event_type');
            $table->string('possession_type', 50)->nullable()->after('possession_id');
            $table->string('description')->nullable()->after('possession_type');
            $table->string('time', 10)->nullable()->after('description');
        });
    }

    
    public function down(): void
    {
        Schema::table('stats', function (Blueprint $table) {
            $table->dropColumn(['possession_id', 'possession_type', 'description', 'time']);
        });
    }
};

