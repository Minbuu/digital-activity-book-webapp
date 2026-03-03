<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ActivityController;
use App\Models\Category;
use App\Models\Department;
use App\Models\User;
use App\Http\Controllers\Api\TeacherController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\AdminController;

Route::get('/teachers', function () {
    // ดึงข้อมูล User ที่เป็นอาจารย์ พร้อมข้อมูล Profile และ แผนก
    return response()->json(User::with(['profile.department'])->where('role', 'teacher')->get());
});
Route::post('/register/teacher', [AuthController::class, 'registerTeacher']);
    Route::get('/public/departments', [AdminController::class, 'getDepartments']); // สำหรับดึงชื่อแผนกโชว์ที่หน้าสมัคร

Route::get('/departments', function () {
    return response()->json(Department::all());
});
// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);


// Routes ที่ต้องมี Token (ต้องล็อกอินก่อนถึงจะใช้งานได้)
Route::middleware('auth:sanctum')->group(function () {
    
    // API ออกจากระบบ
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // API ดึงข้อมูลกิจกรรมของฉัน
    Route::get('/my-activities', [ActivityController::class, 'getMyActivities']);
    
    Route::get('/categories', function () {
        return response()->json(Category::all());
    });
    // สำหรับนักศึกษาขอ QR
    Route::post('/activities/{id}/generate-qr', [ActivityController::class, 'generateQR']);
    Route::get('/student/dashboard-stats', [StudentController::class, 'getDashboardStats']);
    // API สำหรับหน้ารายการกิจกรรมของนักศึกษา
    Route::get('/student/activities', [StudentController::class, 'getActivities']);
    Route::post('/student/activities', [StudentController::class, 'storeActivity']);
    
    // สำหรับอาจารย์ส่ง Token มาตรวจสอบ (อาจารย์ต้อง Login ก่อนสแกน)
    Route::post('/activities/scan-verify', [ActivityController::class, 'scanVerify']);
    Route::get('/teacher/dashboard-stats', [TeacherController::class, 'getDashboardStats']);
    // สำหรับหน้าอนุมัติกิจกรรมของอาจารย์
    Route::get('/teacher/approvals', [TeacherController::class, 'getPendingApprovals']);
    Route::post('/teacher/approvals/{id}/approve', [TeacherController::class, 'approveActivity']);
    Route::get('/teacher/students', [TeacherController::class, 'getAdvisees']);
    Route::get('/teacher/pending-students', [TeacherController::class, 'getPendingStudents']);
    Route::post('/teacher/verify-student/{id}', [TeacherController::class, 'verifyStudent']);
    Route::get('/teacher/student/{id}/activities', [TeacherController::class, 'getStudentActivityDetails']);

    // API ระบบจัดการของ Admin
    Route::get('/admin/dashboard-stats', [AdminController::class, 'getDashboardStats']);
    Route::get('/admin/users', [AdminController::class, 'getUsers']); // 👈 เพิ่มบรรทัดนี้
    Route::delete('/admin/users/{id}', [AdminController::class, 'deleteUser']); // 👈 เพิ่มบรรทัดนี้
    Route::put('/admin/users/{id}/verify', [AdminController::class, 'verifyUser']);
    Route::put('/admin/users/{id}/role', [AdminController::class, 'changeUserRole']);
    // 👇 เพิ่ม 3 บรรทัดนี้สำหรับจัดการแผนกวิชา
    Route::get('/admin/departments', [AdminController::class, 'getDepartments']);
    Route::post('/admin/departments', [AdminController::class, 'storeDepartment']);
    Route::delete('/admin/departments/{id}', [AdminController::class, 'deleteDepartment']);
    Route::get('/admin/activities', [AdminController::class, 'getAllMasterActivities']);
    Route::post('/admin/activities', [AdminController::class, 'storeMasterActivity']);
    Route::delete('/admin/activities/{id}', [AdminController::class, 'deleteMasterActivity']);
    Route::get('/admin/export-report', [AdminController::class, 'exportActivityReport']);
    Route::put('/admin/activities/{id}', [AdminController::class, 'updateMasterActivity']);
    Route::get('/admin/categories', [AdminController::class, 'getCategories']);
});