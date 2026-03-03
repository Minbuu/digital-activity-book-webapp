<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('student_activities', function (Blueprint $table) {
            $table->string('location')->nullable()->after('hours'); // เพิ่มคอลัมน์ location
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
