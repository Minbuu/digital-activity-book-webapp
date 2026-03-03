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
    Schema::create('profiles', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade'); // เชื่อมกับ id ของตาราง users
        $table->string('first_name');
        $table->string('last_name');
        $table->date('birth_date');
        $table->text('address');
        $table->string('student_id')->nullable(); // รหัสนักศึกษา (null ได้ถ้าเป็นอาจารย์)
        // $table->string('department'); // แผนก
        $table->foreignId('department_id')->nullable()->constrained('departments')->onDelete('set null');
        $table->unsignedBigInteger('teacher_id')->nullable(); // id ของอาจารย์ที่ปรึกษา (อ้างอิง users.id)
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profiles');
    }
};
