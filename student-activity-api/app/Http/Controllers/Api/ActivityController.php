<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\StudentActivity;
use Illuminate\Support\Str;
use Carbon\Carbon;

class ActivityController extends Controller
{
    // public function getMyActivities(Request $request)
    // {
    //     // 1. ดึง ID ของนักศึกษาที่ส่ง Token มา
    //     $userId = $request->user()->id;

    //     // 2. ค้นหาประวัติกิจกรรมทั้งหมดของคนๆ นี้
    //     // ใช้ with() เพื่อดึงข้อมูลตารางที่เชื่อมกัน (หมวดหมู่ และ กิจกรรมหลัก) มาพร้อมกันเลย
    //     $activities = StudentActivity::with(['category', 'baseActivity'])
    //         ->where('user_id', $userId)
    //         ->orderBy('created_at', 'desc')
    //         ->get();

    //     // 3. จัด Format ข้อมูลให้ตรงกับที่หน้า React ต้องการ
    //     $formattedActivities = $activities->map(function ($act) {

    //         // เช็คว่าเป็นกิจกรรมที่พิมพ์ชื่อเอง (จิตอาสา) หรือกิจกรรมส่วนกลาง
    //         $title = $act->custom_title ? $act->custom_title : ($act->baseActivity ? $act->baseActivity->title : 'ไม่ระบุชื่อกิจกรรม');

    //         // เช็ควันที่
    //         $date = $act->activity_date ? $act->activity_date : ($act->baseActivity ? $act->baseActivity->start_datetime : $act->created_at);

    //         return [
    //             'id' => $act->id,
    //             'title' => $title,
    //             'date' => $date,
    //             'location' => 'วิทยาลัย/สถานที่จัดงาน', // ตอนนี้ DB เรายังไม่มีฟิลด์สถานที่ เลยใส่ข้อความจำลองไว้ก่อนครับ
    //             'hours' => $act->hours,
    //             'category' => $act->category ? $act->category->name : 'ไม่มีหมวดหมู่',
    //             // ให้ React เข้าใจง่ายๆ: ถ้าอนุมัติแล้ว = completed, ถ้ายัง = upcoming (รออนุมัติ)
    //             'status' => $act->is_approved ? 'completed' : 'upcoming',
    //         ];
    //     });

    //     // 4. ส่งข้อมูลกลับไปเป็น JSON
    //     return response()->json([
    //         'message' => 'ดึงข้อมูลประวัติกิจกรรมสำเร็จ',
    //         'data' => $formattedActivities
    //     ], 200);
    // }
    public function getMyActivities(Request $request)
    {
        $userId = $request->user()->id;

        // โหลด 'approver.profile' มาด้วย
        $activities = StudentActivity::with(['category', 'baseActivity', 'approver.profile'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        $formattedActivities = $activities->map(function ($act) {
            $title = $act->custom_title ?: ($act->baseActivity ? $act->baseActivity->title : 'ไม่ระบุชื่อกิจกรรม');

            return [
                'id' => $act->id,
                'title' => $title,
                'date' => $act->activity_date ?: ($act->baseActivity ? $act->baseActivity->start_datetime : $act->created_at),
                'hours' => $act->hours,
                'category' => $act->category ? $act->category->name : 'ไม่มีหมวดหมู่',
                'status' => $act->is_approved ? 'completed' : 'upcoming',
                // 🆕 ส่งชื่ออาจารย์กลับไปให้ React
                'approver_name' => $act->approver && $act->approver->profile
                    ? "อ.{$act->approver->profile->first_name} {$act->approver->profile->last_name}"
                    : null,
            ];
        });

        return response()->json(['data' => $formattedActivities]);
    }


    // 1. ฟังก์ชันสร้าง QR Token (เฉพาะนักศึกษาเจ้าของกิจกรรม)
    public function generateQR(Request $request, $id)
    {
        $activity = StudentActivity::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        // สร้าง Token สุ่ม 32 ตัวอักษร และตั้งเวลาหมดอายุ 1 นาที
        $token = Str::random(32);
        $activity->update([
            'checkin_token' => $token,
            'token_expires_at' => Carbon::now()->addMinute(1)
        ]);

        return response()->json(['qr_token' => $token]);
    }

    // 2. ฟังก์ชันสแกนยืนยัน (เฉพาะอาจารย์)
    public function scanVerify(Request $request)
    {
        $request->validate(['token' => 'required|string']);

        // ตรวจสอบสิทธิ์: ต้องเป็นอาจารย์เท่านั้นถึงจะสแกนได้
        if ($request->user()->role !== 'teacher') {
            return response()->json(['message' => 'ไม่มีสิทธิ์เข้าถึงฟังก์ชันนี้'], 403);
        }

        // ค้นหากิจกรรมจาก Token และต้องยังไม่หมดอายุ
        $activity = StudentActivity::where('checkin_token', $request->token)
            ->where('token_expires_at', '>', Carbon::now())
            ->first();

        if (!$activity) {
            return response()->json(['message' => 'QR Code หมดอายุหรือข้อมูลไม่ถูกต้อง'], 400);
        }

        // บันทึกสถานะอนุมัติ และบันทึก ID อาจารย์ผู้สแกน
        $activity->update([
            'is_approved' => true,
            'approved_by' => $request->user()->id,
            'checkin_token' => null, // ใช้แล้วเคลียร์ทิ้งทันที (One-time use)
            'token_expires_at' => null
        ]);

        return response()->json(['message' => 'ยืนยันการเข้าร่วมกิจกรรมสำเร็จ!']);
    }
}
