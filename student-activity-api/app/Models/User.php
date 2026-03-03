<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    // ในไฟล์ app/Models/User.php

    protected $fillable = [
        'username',
        'password',
        'role',
        'is_verified',
    ];

    /**
     * ความสัมพันธ์แบบ 1:1 (User 1 คนมีได้ 1 Profile)
     */
    public function profile()
    {
        return $this->hasOne(Profile::class);
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
    // นักศึกษา 1 คน มีประวัติทำกิจกรรมหลายอัน
    public function studentActivities()
    {
        return $this->hasMany(StudentActivity::class, 'user_id');
    }

    // อาจารย์ 1 คน สร้างกิจกรรมส่วนกลางไว้หลายอัน
    public function createdActivities()
    {
        return $this->hasMany(Activity::class, 'created_by');
    }
}
