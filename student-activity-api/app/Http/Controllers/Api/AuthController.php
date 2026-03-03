<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

// ต้องมี 5 บรรทัดนี้ให้ครบนะครับ
use App\Models\User;
use App\Models\Profile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // 1. ตรวจสอบข้อมูลที่ส่งมาจาก React
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|unique:users',
            'password' => 'required|string|min:6|confirmed', // ต้องมีฟิลด์ password_confirmation
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'birth_date' => 'required|date',
            'address' => 'required|string',
            'student_id' => 'nullable|string',
            'department_id' => 'required|integer|exists:departments,id',
            'teacher_id' => 'nullable|integer',
            'role' => 'required|in:student,aat,teacher'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        // 2. เริ่มการบันทึกข้อมูล (ใช้ Transaction)
        try {
            DB::beginTransaction();

            // บันทึกลงตาราง Users
            $user = User::create([
                'username' => $request->username,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'is_verified' => false, // รออาจารย์ยืนยัน
            ]);

            // บันทึกลงตาราง Profiles โดยใช้ ID จาก User ที่เพิ่งสร้าง
            $user->profile()->create([
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'birth_date' => $request->birth_date,
                'address' => $request->address,
                'student_id' => $request->student_id,
                'department_id' => $request->department_id,
                'teacher_id' => $request->teacher_id,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'สมัครสมาชิกสำเร็จ! กรุณารออาจารย์ที่ปรึกษายืนยันการใช้งาน'
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'เกิดข้อผิดพลาดในการสมัครสมาชิก',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function login(Request $request)
    {
        $fields = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string'
        ]);

        // ตรวจสอบ Username
        $user = User::where('username', $fields['username'])->first();

        // ตรวจสอบ Password และสถานะการยืนยัน
        if (!$user || !Hash::check($fields['password'], $user->password)) {
            return response()->json(['message' => 'Username หรือ Password ไม่ถูกต้อง'], 401);
        }

        if (!$user->is_verified) {
            return response()->json(['message' => 'บัญชีนี้ยังไม่ได้รับการยืนยันจากอาจารย์'], 403);
        }

        // สร้าง Token (Sanctum)
        $token = $user->createToken('myapptoken')->plainTextToken;

        // ❌ โค้ดเดิม (ส่งมาแค่ profile เฉยๆ)
        // 'user' => $user->load('profile'),

        // ✅ โค้ดใหม่: สั่งให้โหลดโปรไฟล์ พร้อมกับแนบข้อมูล "แผนก" และ "โปรไฟล์อาจารย์" มาด้วย
        return response()->json([
            // โหลด profile -> โหลด department ต่อ
            // โหลด profile -> โหลด teacher -> โหลด profile ของอาจารย์มาโชว์ชื่อ
            'user' => $user->load(['profile.department', 'profile.teacher.profile']),
            'token' => $token
        ], 200);
    }
    public function logout(Request $request)
    {
        // ทำการลบ Token ปัจจุบันที่ใช้ Login อยู่
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'ออกจากระบบสำเร็จ'
        ], 200);
    }
    public function registerTeacher(Request $request)
    {
        // 1. เพิ่มการตรวจสอบ (Validation)
        $request->validate([
            'username' => 'required|string|unique:users', // 👈 เช็คว่าส่ง username มาไหม
            'password' => 'required|string|min:6',
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'staff_id' => 'required|string|unique:profiles,student_id', // เช็คว่ารหัสพนักงานไม่ซ้ำกับ student_id ของนักศึกษา
            'department_id' => 'required|integer|exists:departments,id',
        ]);

        // 2. ตอนสร้าง User ต้องใส่ username ลงไปด้วย
        $user = User::create([
            'username' => $request->username, // 👈 บรรทัดนี้สำคัญมาก!
            'password' => Hash::make($request->password),
            'role' => 'teacher',
            'is_verified' => false,
        ]);

        // 2. สร้าง Profile
        Profile::create([
        'user_id'       => $user->id,
        'first_name'    => $request->first_name,
        'last_name'     => $request->last_name,
        'birth_date'    => $request->birth_date, // 👈 ต้องมีบรรทัดนี้
        'address'       => $request->address,    // 👈 และบรรทัดนี้
        'student_id'    => $request->staff_id,
        'department_id' => $request->department_id,
        'is_verified'   => false,
    ]);

        return response()->json(['message' => 'Teacher registered successfully'], 201);
    }
}
