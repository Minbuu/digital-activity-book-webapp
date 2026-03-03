<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'title',
        'description',
        'start_datetime',
        'end_datetime',
        'default_hours',
        'created_by'
    ];

    // กิจกรรมนี้ อยู่ในหมวดหมู่ไหน
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    // กิจกรรมนี้ ถูกสร้างโดยใคร (เชื่อมไปตาราง users)
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // กิจกรรมนี้ มีนักศึกษาคนไหนเข้าร่วมบ้าง
    public function studentActivities()
    {
        return $this->hasMany(StudentActivity::class);
    }
}