<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'is_custom_allowed'
    ];

    // 1 หมวดหมู่ มีกิจกรรมส่วนกลาง (ที่อาจารย์สร้าง) ได้หลายอัน
    public function activities()
    {
        return $this->hasMany(Activity::class);
    }

    // 1 หมวดหมู่ มีประวัติการทำกิจกรรมของนักศึกษาได้หลายอัน
    public function studentActivities()
    {
        return $this->hasMany(StudentActivity::class);
    }
}