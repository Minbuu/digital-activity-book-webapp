<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\StudentActivity;
use App\Models\Profile;
use App\Exports\ActivityReportExport;
use Maatwebsite\Excel\Facades\Excel;

class AdminController extends Controller
{
    // ฟังก์ชันดึงสถิติภาพรวมทั้งหมดให้ Admin
    public function getDashboardStats(Request $request)
    {
        try {
            $totalStudents = User::where('role', 'student')->count();
            $totalTeachers = User::where('role', 'teacher')->count();
            $totalActivities = StudentActivity::count();

            // กิจกรรมที่รออาจารย์อนุมัติทั้งระบบ
            $pendingActivities = StudentActivity::where('is_approved', false)->count();

            return response()->json([
                'total_students' => $totalStudents,
                'total_teachers' => $totalTeachers,
                'total_activities' => $totalActivities,
                'pending_activities' => $pendingActivities,
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
    // 1. ดึงรายชื่อผู้ใช้งานทั้งหมด (นักศึกษาและอาจารย์)
    public function getUsers(Request $request)
    {
        try {
            // ดึงข้อมูล User พร้อม Profile และ Department
            $users = User::with('profile.department')
                ->whereIn('role', ['student', 'teacher'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function($user) {
                    return [
                        'id' => $user->id,
                        'email' => $user->email,
                        'role' => $user->role,
                        'is_verified' => $user->is_verified,
                        'first_name' => $user->profile ? $user->profile->first_name : 'ไม่ระบุ',
                        'last_name' => $user->profile ? $user->profile->last_name : '',
                        'student_id' => $user->profile ? $user->profile->student_id : '-',
                        'department' => ($user->profile && $user->profile->department) ? $user->profile->department->name : '-',
                        'registered_at' => $user->created_at,
                    ];
                });

            return response()->json($users, 200);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    // 2. ฟังก์ชันลบผู้ใช้งาน
    public function deleteUser($id)
    {
        try {
            $user = User::find($id);
            if (!$user) {
                return response()->json(['message' => 'ไม่พบผู้ใช้งานในระบบ'], 404);
            }

            // ลบข้อมูลที่ผูกกับ User นี้ทิ้งด้วย ป้องกันขยะในฐานข้อมูล
            Profile::where('user_id', $id)->delete();
            StudentActivity::where('user_id', $id)->delete();
            
            // ลบ User
            $user->delete();

            return response()->json(['message' => 'ลบผู้ใช้งานสำเร็จเรียบร้อย'], 200);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
    // 3. ฟังก์ชันกดยืนยันบัญชีผู้ใช้ (โดย Admin)
    public function verifyUser($id)
    {
        try {
            $user = \App\Models\User::find($id);
            if (!$user) {
                return response()->json(['message' => 'ไม่พบผู้ใช้งานในระบบ'], 404);
            }

            // อัปเดตสถานะเป็นยืนยันแล้ว
            $user->is_verified = true;
            $user->save();

            // อัปเดตในตาราง profile ด้วย (ถ้ามี)
            if ($user->profile) {
                $user->profile->is_verified = true;
                $user->profile->save();
            }

            return response()->json(['message' => 'ยืนยันบัญชีผู้ใช้งานสำเร็จ'], 200);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
    // 4. ดึงรายชื่อแผนกวิชาทั้งหมด
    public function getDepartments()
    {
        try {
            // ดึงข้อมูลแผนกเรียงตามตัวอักษร
            $departments = \App\Models\Department::orderBy('name', 'asc')->get();
            return response()->json($departments, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    // 5. เพิ่มแผนกวิชาใหม่
    public function storeDepartment(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255|unique:departments,name'
            ]);

            $dept = new \App\Models\Department();
            $dept->name = $request->name;
            $dept->save();

            return response()->json(['message' => 'เพิ่มแผนกวิชาสำเร็จ', 'department' => $dept], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'เกิดข้อผิดพลาด หรือมีแผนกวิชานี้อยู่แล้ว'], 500);
        }
    }

    // 6. ลบแผนกวิชา
    public function deleteDepartment($id)
    {
        try {
            $dept = \App\Models\Department::find($id);
            if (!$dept) {
                return response()->json(['message' => 'ไม่พบแผนกวิชา'], 404);
            }

            // (ทางเลือก) ถ้าอยากให้ปลอดภัยสุดๆ อาจจะต้องเช็คก่อนว่ามีเด็กอยู่ในแผนกนี้ไหม
            // แต่สำหรับเบื้องต้น เราให้ลบได้เลย
            $dept->delete();

            return response()->json(['message' => 'ลบแผนกวิชาสำเร็จ'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
    // 7. ฟังก์ชันเปลี่ยนสิทธิ์ (Role) ของผู้ใช้งาน
    public function changeUserRole(Request $request, $id)
    {
        try {
            $request->validate([
                'role' => 'required|string|in:student,teacher,admin'
            ]);

            $user = \App\Models\User::find($id);
            if (!$user) {
                return response()->json(['message' => 'ไม่พบผู้ใช้งาน'], 404);
            }

            // อัปเดต Role
            $user->role = $request->role;
            $user->save();

            return response()->json([
                'message' => 'เปลี่ยนสิทธิ์ผู้ใช้งานสำเร็จ',
                'new_role' => $user->role
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
    // 8. ดึงรายการกิจกรรมส่วนกลางทั้งหมด
    public function getAllMasterActivities()
    {
        try {
            // ดึงกิจกรรมพร้อมข้อมูลหมวดหมู่
            $activities = \App\Models\Activity::with('category')->orderBy('created_at', 'desc')->get();
            return response()->json($activities, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    // 9. เพิ่มกิจกรรมส่วนกลางใหม่
    public function storeMasterActivity(Request $request)
    {
        try {
            $request->validate([
                'title' => 'required|string|max:255',
                'hours' => 'required|integer|min:1',
                'category_id' => 'nullable|exists:categories,id',
                'description' => 'nullable|string'
            ]);

            $activity = new \App\Models\Activity();
            $activity->title = $request->title;
            $activity->description = $request->description;
            $activity->hours = $request->hours;
            $activity->category_id = $request->category_id;
            $activity->save();

            return response()->json(['message' => 'เพิ่มกิจกรรมส่วนกลางสำเร็จ', 'activity' => $activity], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'], 500);
        }
    }

    // 10. ลบกิจกรรมส่วนกลาง
    public function deleteMasterActivity($id)
    {
        try {
            $activity = \App\Models\Activity::find($id);
            if (!$activity) return response()->json(['message' => 'ไม่พบกิจกรรม'], 404);
            
            $activity->delete();
            return response()->json(['message' => 'ลบกิจกรรมสำเร็จ'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
    public function exportActivityReport()
{
    return Excel::download(new ActivityReportExport, 'report_activities_' . date('Ymd') . '.xlsx');
}
// 11. ฟังก์ชันแก้ไขกิจกรรมส่วนกลาง
    public function updateMasterActivity(Request $request, $id)
    {
        try {
            $request->validate([
                'title' => 'required|string|max:255',
                'hours' => 'required|integer|min:1',
                'category_id' => 'nullable|exists:categories,id',
                'description' => 'nullable|string'
            ]);

            $activity = \App\Models\Activity::find($id);
            if (!$activity) return response()->json(['message' => 'ไม่พบกิจกรรม'], 404);

            $activity->title = $request->title;
            $activity->description = $request->description;
            $activity->hours = $request->hours;
            $activity->category_id = $request->category_id;
            $activity->save();

            return response()->json(['message' => 'แก้ไขกิจกรรมสำเร็จ', 'activity' => $activity], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
    // ดึงหมวดหมู่ทั้งหมดสำหรับเลือกใน Dropdown
    public function getCategories()
    {
        return response()->json(\App\Models\Category::all(), 200);
    }
}