<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Profile; // 👈 เปลี่ยนมาใช้ Profile
use App\Models\StudentActivity;

class TeacherController extends Controller
{
    public function getDashboardStats(Request $request)
    {
        try {
            // 1. ดึง ID ของอาจารย์ที่ล็อกอินอยู่
            $teacherId = $request->user()->id;

            // 2. หานักศึกษาทั้งหมดที่มีอาจารย์คนนี้เป็นที่ปรึกษา (หาจากตาราง profiles โดยตรง)
            $studentIds = Profile::where('teacher_id', $teacherId)->pluck('user_id');

            // 3. นับจำนวนนักศึกษา
            $studentCount = Profile::where('teacher_id', $teacherId)
                ->whereHas('user', function($query) {
                    $query->where('role', 'student')->where('is_verified', true); // นับเฉพาะนักศึกษาที่ยืนยันแล้ว
                })
                ->count();

            // 4. นับจำนวนกิจกรรมที่ "ยังไม่อนุมัติ" ของกลุ่มนักศึกษาข้างต้น
            $pendingCount = StudentActivity::whereIn('user_id', $studentIds)
                ->where('is_approved', false)
                ->count();

            return response()->json([
                'student_count' => $studentCount,
                'pending_activities_count' => $pendingCount
            ], 200);

        } catch (\Exception $e) {
            // ถ้ามี Error ให้ส่งข้อความออกมา จะได้รู้ว่าพังที่ไหน (ไม่แอบพังเงียบๆ เป็น 500)
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
    // 1. ฟังก์ชันดึงรายการกิจกรรมที่รอการอนุมัติ
    // 1. ฟังก์ชันดึงรายการกิจกรรมที่รอการอนุมัติ (เวอร์ชันปลอดภัย 100%)
    public function getPendingApprovals(Request $request)
    {
        try {
            $teacherId = $request->user()->id;

            // หานักศึกษาในที่ปรึกษา
            $studentIds = \App\Models\Profile::where('teacher_id', $teacherId)->pluck('user_id');

            // ดึงกิจกรรมที่ยังไม่อนุมัติ (ไม่ต้องใช้ with() เพื่อป้องกัน Error หากไม่ได้ทำ Model Relation ไว้)
            $pending = \App\Models\StudentActivity::whereIn('user_id', $studentIds)
                ->where('is_approved', false)
                ->orderBy('created_at', 'asc')
                ->get();

            // จัด Format ข้อมูลส่งให้ React
            $data = $pending->map(function($act) {
                // ดึงชื่อนักศึกษาแบบตรงไปตรงมา
                $profile = \App\Models\Profile::where('user_id', $act->user_id)->first();
                
                return [
                    'id' => $act->id,
                    'student_name' => $profile ? $profile->first_name . ' ' . $profile->last_name : 'ไม่ทราบชื่อ',
                    'student_id' => $profile ? $profile->student_id : 'ไม่ระบุรหัส',
                    'title' => $act->custom_title ?: 'กิจกรรมจิตอาสา (ไม่ได้ระบุชื่อ)',
                    'category' => 'ทั่วไป', // ใช้ค่า Default ไปก่อน ป้องกัน Error
                    'date' => $act->activity_date ?: $act->created_at,
                    'hours' => $act->hours ?: 0,
                    'location' => $act->location ?: 'ไม่ระบุ',
                ];
            });

            return response()->json($data, 200);

        } catch (\Exception $e) {
            // ถ้าพัง ให้ส่งสาเหตุออกมา จะได้รู้ว่าเกิดจากอะไร
            return response()->json(['message' => 'เกิดข้อผิดพลาด: ' . $e->getMessage()], 500);
        }
    }

    // 2. ฟังก์ชันกดยืนยันอนุมัติกิจกรรม
    public function approveActivity(Request $request, $id)
    {
        $teacherId = $request->user()->id;
        
        $activity = StudentActivity::find($id);
        if (!$activity) {
            return response()->json(['message' => 'ไม่พบกิจกรรมนี้'], 404);
        }

        // อัปเดตสถานะและลงชื่ออาจารย์ผู้อนุมัติ
        $activity->update([
            'is_approved' => true,
            'approved_by' => $teacherId
        ]);

        return response()->json(['message' => 'อนุมัติกิจกรรมสำเร็จ!']);
    }
    // ฟังก์ชันดึงรายชื่อนักศึกษาในที่ปรึกษา
    // ฟังก์ชันดึงรายชื่อนักศึกษาในที่ปรึกษา (เฉพาะที่ยืนยันแล้วเท่านั้น!)
    public function getAdvisees(Request $request)
    {
        try {
            $teacherId = $request->user()->id;

            // ค้นหาจากตาราง User โดยตรง บังคับว่าต้องเป็นนักศึกษา และ is_verified = true เท่านั้น
            $students = \App\Models\User::with('profile')
                ->where('role', 'student')
                ->where('is_verified', true) // 👈 จุดสำคัญ: กรองเอาเฉพาะคนที่ยืนยันแล้ว
                ->whereHas('profile', function($query) use ($teacherId) {
                    $query->where('teacher_id', $teacherId);
                })
                ->get();

            $data = $students->map(function($student) {
                return [
                    'id' => $student->id,
                    'student_id' => $student->profile ? $student->profile->student_id : 'ไม่ระบุรหัส',
                    'first_name' => $student->profile ? $student->profile->first_name : '-',
                    'last_name' => $student->profile ? $student->profile->last_name : '-',
                    // นับชั่วโมงกิจกรรมที่ผ่านการอนุมัติแล้วของนักศึกษาคนนี้
                    'approved_hours' => \App\Models\StudentActivity::where('user_id', $student->id)
                                        ->where('is_approved', true)
                                        ->sum('hours'),
                ];
            });

            return response()->json($data, 200);

        } catch (\Exception $e) {
            return response()->json(['message' => 'เกิดข้อผิดพลาด: ' . $e->getMessage()], 500);
        }
    }
    // 1. ดึงรายชื่อนักศึกษาใหม่ที่ "รอการยืนยันตัวตน"
    public function getPendingStudents(Request $request)
    {
        try {
            $teacherId = $request->user()->id;

            // ดึงข้อมูล User ที่เป็น student, ยังไม่ verify และเลือก teacher_id ตรงกับอาจารย์คนนี้
            $pendingStudents = \App\Models\User::with('profile')
                ->where('role', 'student')
                ->where('is_verified', false) // 👈 หาคนที่ยังไม่ verify
                ->whereHas('profile', function($query) use ($teacherId) {
                    $query->where('teacher_id', $teacherId);
                })
                ->get();

            $data = $pendingStudents->map(function($student) {
                return [
                    'user_id' => $student->id,
                    'student_id' => $student->profile ? $student->profile->student_id : '-',
                    'first_name' => $student->profile ? $student->profile->first_name : 'ไม่ระบุ',
                    'last_name' => $student->profile ? $student->profile->last_name : '',
                    'email' => $student->email,
                    'registered_at' => $student->created_at,
                ];
            });

            return response()->json($data, 200);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    // 2. ฟังก์ชันกดยืนยันรับนักศึกษาเข้าที่ปรึกษา
    public function verifyStudent(Request $request, $id)
    {
        try {
            $user = \App\Models\User::find($id);
            
            if (!$user) {
                return response()->json(['message' => 'ไม่พบข้อมูลนักศึกษา'], 404);
            }

            // เปลี่ยนสถานะเป็น ยืนยันแล้ว!
            $user->is_verified = true;
            $user->save();

            // (แถม) ถ้ามี is_verified ในตาราง profiles ด้วย ก็อัปเดตให้ตรงกัน
            if ($user->profile) {
                $user->profile->is_verified = true;
                $user->profile->save();
            }

            return response()->json(['message' => 'ยืนยันตัวตนนักศึกษาสำเร็จ!'], 200);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
    public function getStudentActivityDetails(Request $request, $studentId)
    {
        try {
            $teacherId = $request->user()->id;

            // 1. เช็คก่อนว่าเด็กคนนี้อยู่ในความดูแลของอาจารย์คนนี้จริงๆ ป้องกันการแอบดูข้ามห้อง
            $profile = \App\Models\Profile::where('user_id', $studentId)
                ->where('teacher_id', $teacherId)
                ->first();

            if (!$profile) {
                return response()->json(['message' => 'ไม่พบข้อมูล หรือนักศึกษาไม่ได้อยู่ในที่ปรึกษาของคุณ'], 404);
            }

            // 2. ดึงกิจกรรมทั้งหมดของเด็กคนนี้
            $activities = \App\Models\StudentActivity::where('user_id', $studentId)
                ->orderBy('created_at', 'desc')
                ->get();

            // 3. คำนวณสถิติ
            $approvedCount = $activities->where('is_approved', true)->count();
            $approvedHours = $activities->where('is_approved', true)->sum('hours');
            $pendingCount = $activities->where('is_approved', false)->count();

            // 4. จัด Format รายชื่อกิจกรรม
            $formattedActivities = $activities->map(function($act) {
                return [
                    'id' => $act->id,
                    'title' => $act->custom_title ?: 'กิจกรรมจิตอาสา',
                    'date' => $act->activity_date ?: $act->created_at,
                    'hours' => $act->hours ?: 0,
                    'location' => $act->location ?: 'ไม่ระบุ',
                    'is_approved' => $act->is_approved
                ];
            })->values(); // reset keys

            // ส่งข้อมูลกลับไปให้ React
            return response()->json([
                'student' => [
                    'first_name' => $profile->first_name,
                    'last_name' => $profile->last_name,
                    'student_id' => $profile->student_id ?: 'ไม่ระบุรหัส',
                ],
                'stats' => [
                    'approved_count' => $approvedCount,
                    'approved_hours' => $approvedHours,
                    'pending_count' => $pendingCount,
                ],
                'activities' => $formattedActivities
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['message' => 'เกิดข้อผิดพลาด: ' . $e->getMessage()], 500);
        }
    }
}