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
        Schema::table('student_activities', function (Blueprint $table) {
            $table->string('checkin_token')->nullable()->unique(); // รหัสสำหรับสแกน
            $table->timestamp('token_expires_at')->nullable(); // เวลาหมดอายุ
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_activities', function (Blueprint $table) {
            //
        });
    }
};
