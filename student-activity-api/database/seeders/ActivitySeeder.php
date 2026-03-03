<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Activity;
use App\Models\Category;
use App\Models\User;
use App\Models\StudentActivity;
use Carbon\Carbon;
use App\Models\Department;

class ActivitySeeder extends Seeder
{
    public function run(): void
    {
        // 1. หา User ที่เป็นนักศึกษาคนแรกในระบบ (เพื่อจะผูกประวัติกิจกรรมให้)
        $student = User::where('role', 'student')->first();
        
        // สมมติให้อาจารย์เป็นคนแรกที่เจอในระบบ (หรือสร้างขึ้นมาใหม่ถ้ายังไม่มี)
        $teacher = User::where('role', 'teacher')->first();
        if (!$teacher) {
            $teacher = User::create([
                'username' => 'teacher_demo',
                'password' => bcrypt('password123'),
                'role' => 'teacher',
                'is_verified' => true,
            ]);
            
            // ดึง ID ของแผนกเทคโนโลยีสารสนเทศมาใช้
            $itDept = Department::where('name', 'เทคโนโลยีสารสนเทศ')->first();

            $teacher->profile()->create([
                'first_name' => 'สมหมาย',
                'last_name' => 'ใจดี',
                'birth_date' => '1980-01-01',
                'address' => 'วิทยาลัยเทคนิค',
                // ลบบรรทัด 'department' => 'เทคโนโลยีสารสนเทศ', ทิ้งไป
                'department_id' => $itDept ? $itDept->id : null, // 👈 ใช้อันนี้แทน
            ]);
        }

        // 2. ดึงหมวดหมู่มาใช้งาน
        $catFlag = Category::where('name', 'หน้าเสาธง')->first()->id ?? 1;
        $catCollege = Category::where('name', 'วิทยาลัย')->first()->id ?? 2;
        $catVolunteer = Category::where('name', 'จิตอาสา')->first()->id ?? 5;

        // ---------------------------------------------------------
        // 3. สร้างกิจกรรมส่วนกลาง (ตาราง activities)
        // ---------------------------------------------------------
        $act1 = Activity::create([
            'category_id' => $catFlag,
            'title' => 'กิจกรรมหน้าเสาธง ปฐมนิเทศนักศึกษาใหม่',
            'description' => 'รวมตัวหน้าเสาธงเพื่อรับฟังนโยบายวิทยาลัย',
            'start_datetime' => Carbon::now()->subDays(10)->setTime(8, 0), // ย้อนหลังไป 10 วัน
            'end_datetime' => Carbon::now()->subDays(10)->setTime(9, 0),
            'default_hours' => 1,
            'created_by' => $teacher->id,
        ]);

        $act2 = Activity::create([
            'category_id' => $catCollege,
            'title' => 'สัมมนาวิชาการ เทคโนโลยี AI ในยุคดิจิทัล',
            'description' => 'เชิญวิทยากรพิเศษมาให้ความรู้เรื่อง AI',
            'start_datetime' => Carbon::now()->addDays(5)->setTime(13, 0), // ล่วงหน้า 5 วัน (กำลังจะมาถึง)
            'end_datetime' => Carbon::now()->addDays(5)->setTime(16, 0),
            'default_hours' => 3,
            'created_by' => $teacher->id,
        ]);

        // ---------------------------------------------------------
        // 4. ผูกประวัติให้นักศึกษา (ตาราง student_activities) 
        // เพื่อให้ไปโชว์ใน React ทันทีที่ล็อกอิน
        // ---------------------------------------------------------
        if ($student) {
            // กิจกรรมที่ 1: เสร็จสิ้นแล้ว (is_approved = true)
            StudentActivity::create([
                'user_id' => $student->id,
                'category_id' => $act1->category_id,
                'activity_id' => $act1->id,
                'custom_title' => null,
                'hours' => $act1->default_hours,
                'is_approved' => true, 
                'approved_by' => $teacher->id,
            ]);

            // กิจกรรมที่ 2: กำลังจะมาถึง / รออนุมัติ (is_approved = false)
            StudentActivity::create([
                'user_id' => $student->id,
                'category_id' => $act2->category_id,
                'activity_id' => $act2->id,
                'custom_title' => null,
                'hours' => $act2->default_hours,
                'is_approved' => false,
                'approved_by' => null,
            ]);

            // กิจกรรมที่ 3: จิตอาสา (นักศึกษาพิมพ์ชื่อเอง ไม่ได้อิงจากตารางกิจกรรมส่วนกลาง)
            StudentActivity::create([
                'user_id' => $student->id,
                'category_id' => $catVolunteer,
                'activity_id' => null, // เป็น null เพราะพิมพ์เอง
                'custom_title' => 'กวาดลานวัดใกล้ชุมชน',
                'activity_date' => Carbon::now()->subDays(2),
                'hours' => 2,
                'is_approved' => true,
                'approved_by' => $teacher->id,
            ]);
        }
    }
}