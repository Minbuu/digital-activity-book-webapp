<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // เช่น หน้าเสาธง, วิทยาลัย, จิตอาสา
            $table->boolean('is_custom_allowed')->default(false); // อนุญาตให้นศ.พิมพ์ชื่อกิจกรรมเองไหม (จิตอาสา = true)
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};