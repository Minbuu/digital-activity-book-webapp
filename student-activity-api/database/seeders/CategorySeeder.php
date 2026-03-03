<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category; // อย่าลืม import Model ด้วยนะครับ

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'หน้าเสาธง', 'is_custom_allowed' => false],
            ['name' => 'วิทยาลัย', 'is_custom_allowed' => false],
            ['name' => 'ศาสนา', 'is_custom_allowed' => false],
            ['name' => 'พระมหากษัตริย์', 'is_custom_allowed' => false],
            // จิตอาสา และ อื่นๆ อนุญาตให้นักศึกษาพิมพ์ชื่อกิจกรรมเองได้
            ['name' => 'จิตอาสา', 'is_custom_allowed' => true],
            
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}