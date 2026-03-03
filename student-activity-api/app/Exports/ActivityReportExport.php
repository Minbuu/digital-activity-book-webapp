<?php

namespace App\Exports;

use App\Models\User;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ActivityReportExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        // ดึงนักศึกษาทุกคนพร้อมโปรไฟล์และชั่วโมงที่อนุมัติแล้ว
        return User::where('role', 'student')
            ->with(['profile.department'])
            ->get();
    }

    // กำหนดหัวตาราง
    public function headings(): array
    {
        return ["รหัสนักศึกษา", "ชื่อ-นามสกุล", "แผนกวิชา", "ชั่วโมงสะสม (เซ็นแล้ว)"];
    }

    // กำหนดข้อมูลในแต่ละแถว
    public function map($user): array
    {
        $approvedHours = \App\Models\StudentActivity::where('user_id', $user->id)
            ->where('is_approved', true)
            ->sum('hours');

        return [
            $user->profile->student_id ?? '-',
            ($user->profile->first_name ?? '') . ' ' . ($user->profile->last_name ?? ''),
            $user->profile->department->name ?? '-',
            $approvedHours . ' ชั่วโมง',
        ];
    }
}