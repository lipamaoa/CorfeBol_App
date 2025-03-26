<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stats', function (Blueprint $table) {
            // Remove as colunas possession_id, possession_type e event_type
            $table->dropColumn([ 'event_type']);

          
        });
    }

    public function down(): void
    {
        Schema::table('stats', function (Blueprint $table) {
            // Recria as colunas removidas
            $table->integer('possession_id')->nullable()->after('event_id');
            $table->string('possession_type', 50)->nullable()->after('possession_id');
            $table->string('event_type')->nullable()->after('possession_type');

          
        });
    }
};
