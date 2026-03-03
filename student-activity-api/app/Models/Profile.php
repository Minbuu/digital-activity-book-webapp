<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    use HasFactory;

    // กำหนดฟิลด์ที่อนุญาตให้บันทึกข้อมูลได้ (Mass Assignment)
    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'birth_date',
        'address',
        'student_id',
        'department_id',
        'teacher_id',
    ];

    /**
     * เชื่อมความสัมพันธ์กลับไปที่ User (Profile นี้เป็นของ User คนไหน)
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // 🆕 เพิ่มความสัมพันธ์: โปรไฟล์นี้อยู่แผนกอะไร

    public function department()
    {
        // เชื่อม department_id ใน profiles ไปหา id ใน departments
        return $this->belongsTo(Department::class, 'department_id');
    }

    public function teacher()
    {
        // เชื่อม teacher_id ใน profiles ไปหา id ใน users
        return $this->belongsTo(User::class, 'teacher_id');
    }
}
