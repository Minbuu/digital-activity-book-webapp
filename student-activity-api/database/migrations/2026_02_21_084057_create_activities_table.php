<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->onDelete('cascade'); // อยู่หมวดหมู่ไหน
            $table->string('title'); // ชื่อกิจกรรม
            $table->text('description')->nullable(); // รายละเอียดกิจกรรม
            $table->dateTime('start_datetime')->nullable(); // วันและเวลาที่เริ่มกิจกรรม
            $table->dateTime('end_datetime')->nullable(); // วันและเวลาที่สิ้นสุดกิจกรรม
            $table->integer('default_hours'); // จำนวนชั่วโมงที่จะได้รับ
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade'); // อาจารย์/แอดมินคนไหนสร้าง
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activities');
    }
};