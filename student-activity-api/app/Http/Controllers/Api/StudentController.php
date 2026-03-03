<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\StudentActivity;
use App\Models\Profile;

class StudentController extends Controller
{
    public function getDashboardStats(Request $request)
    {
        try {
            $user = $request->user();

            // 1. นับจำนวน "กิจกรรมที่เข้าร่วม" (✅ บังคับว่าต้องเซ็นอนุมัติแล้วเท่านั้น)
            $totalActivities = StudentActivity::where('user_id', $user->id)
                ->where('is_approved', true) // 👈 เพิ่มเงื่อนไขบรรทัดนี้
                ->count();

            // 2. นับ "ชั่วโมงกิจกรรมสะสม" (✅ บังคับว่าต้องเซ็นอนุมัติแล้วเท่านั้น)
            $totalHours = StudentActivity::where('user_id', $user->id)
                ->where('is_approved', true)
                ->sum('hours');

            // 3. โหลดข้อมูล Profile และแผนก
            $user->load('profile.department');

            // 4. ดึงชื่ออาจารย์ที่ปรึกษาให้ถูกต้อง (แก้บั๊ก undefined)
            $teacherName = null;
            if ($user->profile && $user->profile->teacher_id) {
                // ค้นหา Profile ของอาจารย์โดยตรง
                $teacherProfile = Profile::where('user_id', $user->profile->teacher_id)->first();
                if ($teacherProfile) {
                    $teacherName = $teacherProfile->first_name . ' ' . $teacherProfile->last_name;
                }
            }

            return response()->json([
                'total_activities' => $totalActivities,
                'total_hours' => $totalHours,
                'profile' => $user->profile,
                'teacher_name' => $teacherName,
    
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
    // 1. ดึงรายการกิจกรรมทั้งหมดของนักศึกษา
    // 1. ดึงรายการกิจกรรมทั้งหมดของนักศึกษา (เวอร์ชันแก้บั๊กไม่แสดงข้อมูล)
    public function getActivities(Request $request)
    {
        try {
            // ดึงกิจกรรมมาทั้งหมดโดยไม่ต้องใช้ with() ป้องกันปัญหา Model Relation ไม่สมบูรณ์
            $activities = StudentActivity::where('user_id', $request->user()->id)
                ->orderBy('created_at', 'desc')
                ->get();

            // ดึงชื่ออาจารย์ที่ปรึกษาแค่ครั้งเดียว 
            $teacherName = 'อ.ไม่ทราบชื่อ';
            $profile = Profile::where('user_id', $request->user()->id)->first();
            if ($profile && $profile->teacher_id) {
                $teacher = Profile::where('user_id', $profile->teacher_id)->first();
                if ($teacher) {
                    $teacherName = 'อ.' . $teacher->first_name . ' ' . $teacher->last_name;
                }
            }

            $data = $activities->map(function($act) use ($teacherName) {
                // หากิจกรรมเก่าที่ไม่มี custom_title แต่มี activity_id
                $title = $act->custom_title;
                $date = $act->activity_date;

                if (empty($title) && $act->activity_id) {
                    $baseActivity = \App\Models\Activity::find($act->activity_id);
                    if ($baseActivity) {
                        $title = $baseActivity->title;
                        $date = $baseActivity->start_datetime;
                    }
                }

                return [
                    'id' => $act->id,
                    'title' => $title ?: 'กิจกรรมจิตอาสา', // ถ้าหาชื่อไม่ได้จริงๆ ให้แสดงคำนี้
                    'date' => $date ?: $act->created_at,
                    'hours' => $act->hours ?: 0,
                    'location' => $act->location ?: 'ไม่ระบุสถานที่',
                    'is_approved' => (bool) $act->is_approved, // แปลง 0/1 ให้เป็น false/true แท้ๆ
                    'teacher_name' => $teacherName
                ];
            });

            return response()->json($data, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    // 2. รับข้อมูลจากฟอร์มเพื่อบันทึกกิจกรรมใหม่
    // 2. รับข้อมูลจากฟอร์มเพื่อบันทึกกิจกรรมใหม่ (อัปเดตระบบหมวดหมู่)
    public function storeActivity(Request $request)
    {
        try {
            $request->validate([
                'title' => 'required|string|max:255',
                'date' => 'required|date',
                'hours' => 'required|integer|min:1',
                'location' => 'required|string|max:255',
            ]);

            // 1. ค้นหาหมวดหมู่ที่ชื่อ 'จิตอาสา' ถ้าไม่มีในฐานข้อมูล ให้สร้างใหม่เลย ป้องกัน Error
            $category = \App\Models\Category::where('name', 'จิตอาสา')->first();
            if (!$category) {
                $category = new \App\Models\Category();
                $category->name = 'จิตอาสา';
                $category->save();
            }

            // 2. บันทึกกิจกรรมพร้อมผูก ID หมวดหมู่
            $activity = new StudentActivity();
            $activity->user_id = $request->user()->id;
            $activity->category_id = $category->id; // 👈 จุดสำคัญ: ผูกเข้าหมวดหมู่จิตอาสาแล้ว!
            $activity->custom_title = $request->title;
            $activity->activity_date = $request->date;
            $activity->hours = $request->hours;
            $activity->location = $request->location;
            $activity->is_approved = false; 
            $activity->save();

            return response()->json(['message' => 'บันทึกกิจกรรมสำเร็จ'], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
}