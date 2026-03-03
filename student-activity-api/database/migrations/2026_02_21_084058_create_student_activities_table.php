<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // นักศึกษา
            $table->foreignId('category_id')->constrained()->onDelete('cascade'); // หมวดหมู่ที่ทำ

            // กรณีเลือกกิจกรรมที่อาจารย์สร้างให้ (จะเป็น ID)
            $table->foreignId('activity_id')->nullable()->constrained()->onDelete('set null');

            // กรณีจิตอาสา (พิมพ์ชื่อเอง จะบันทึกทับตรงนี้แทน activity_id)
            $table->string('custom_title')->nullable();

            $table->date('activity_date')->nullable(); // วันที่ทำกิจกรรม (กรณีจิตอาสา นศ.เลือกวันเอง)
            $table->integer('hours'); // จำนวนชั่วโมง
            $table->string('signature_path')->nullable(); // ลายเซ็นดิจิทัล
            $table->boolean('is_approved')->default(false); // อาจารย์อนุมัติหรือยัง
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null'); // ใครเป็นคนอนุมัติ
            $table->string('checkin_token')->nullable()->unique(); // สำหรับเก็บรหัสสแกนชั่วคราว
            $table->timestamp('token_expires_at')->nullable(); // เวลาหมดอายุของ QR
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_activities');
    }
};
