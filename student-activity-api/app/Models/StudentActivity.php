<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'category_id',
        'activity_id',
        'custom_title',
        'activity_date',
        'location',
        'hours',
        'is_approved',
        'approved_by',
        'checkin_token',     // 👈 เพิ่มบรรทัดนี้
        'token_expires_at',  // 👈 เพิ่มบรรทัดนี้
    ];

    // ประวัตินี้ เป็นของนักศึกษาคนไหน
    public function student()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // ประวัตินี้ อยู่ในหมวดหมู่ไหน
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    // ประวัตินี้ อ้างอิงจากกิจกรรมส่วนกลางอันไหน (ถ้ามี)
    public function baseActivity()
    {
        return $this->belongsTo(Activity::class, 'activity_id');
    }

    // ประวัตินี้ ถูกอนุมัติโดยอาจารย์คนไหน
    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}