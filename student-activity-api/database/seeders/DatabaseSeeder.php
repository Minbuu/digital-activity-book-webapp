<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            DepartmentSeeder::class, // 1. สร้างแผนก
            CategorySeeder::class,   // 2. สร้างหมวดหมู่ (น่าจะลืมบรรทัดนี้ครับ!)
            ActivitySeeder::class,   // 3. สร้างกิจกรรม (อ้างอิงจากแผนกและหมวดหมู่)
        ]);
    }
}
