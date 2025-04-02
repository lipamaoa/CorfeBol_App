<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration {
    public function up(): void
    {
        DB::table('actions')->insert([
            'id' => 19,
            'code' => 'GS',
            'description' => 'Goal Suffered',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('actions')->where('code', 'GS')->delete();
    }
};

