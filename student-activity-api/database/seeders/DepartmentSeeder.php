<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            'เทคโนโลยีธุรกิจดิจิทัล',
            'การบัญชี',
            'การตลาด',
            'การจัดการ',
            'อาหารและโภชนาการ',
            'แฟชั่นและเครื่องแต่งกาย',
            'ภาษาต่างประเทศธุรกิจ',
            'คหกรรมศาสตร์',
            'การจัดการธุรกิจค้าปลีก'
        ];

        foreach ($departments as $dept) {
            Department::create(['name' => $dept]);
        }
    }
}