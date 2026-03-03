import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

// 👇 1. นำเข้าไฟล์ Component ของคุณ 
// (เมื่อนำไปใส่ VS Code ของคุณ ให้เอาเครื่องหมาย // ออกนะครับ)
import Login from './pages/Login';
import Register from './pages/Register';
// import Dashboard from './pages/Dashboard';
import StudentDashboard from './pages/StudentDashboard';
import Activities from './pages/Activities';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherScan from './pages/TeacherScan';
import TeacherApprovals from './pages/TeacherApprovals';
import TeacherProfile from './pages/TeacherProfile';
import TeacherStudents from './pages/TeacherStudents';
import TeacherVerifyStudents from './pages/TeacherVerifyStudents';
import TeacherStudentDetails from './pages/TeacherStudentDetails';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminDepartments from './pages/AdminDepartments';
import AdminActivities from './pages/AdminActivities';
import TeacherRegister from './pages/TeacherRegister';
// ---------------------------------------------------------
// (โค้ด 2 บรรทัดนี้เป็นเพียงตัวจำลองเพื่อให้ระบบแสดงผลหน้าจอตัวอย่างได้ 
// คุณโกมีนสามารถลบ 2 บรรทัดนี้ทิ้งตอนก๊อปปี้ไปวางใน VS Code ได้เลยครับ)

// ---------------------------------------------------------

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        
        

        {/* 👇 3. กำหนดเส้นทาง (Routes) ว่า URL ไหน ให้ดึงหน้าไหนมาแสดง */}
        <div className="p-4">
          <Routes>
            <Route path="/" element={<Login />} />
            {/* <Route path="/login" element={<Login />} /> */}
            <Route path="/register" element={<Register />} />
            {/* <Route path="/dashboard" element={<Dashboard />} /> */}
            <Route path="/studentdashboard" element={<StudentDashboard />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/teacherdashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/scan" element={<TeacherScan />} />
            <Route path="/teacher/approvals" element={<TeacherApprovals />} />
            <Route path="/teacher/profile" element={<TeacherProfile />} />
            <Route path="/teacher/students" element={<TeacherStudents />} />
            <Route path="/teacher/verify-students" element={<TeacherVerifyStudents />} />
            <Route path="/teacher/student/:id" element={<TeacherStudentDetails />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admindashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/departments" element={<AdminDepartments />} />
            <Route path="/admin/activities" element={<AdminActivities />} />
            <Route path="/teacher/register" element={<TeacherRegister />} />
          </Routes>
        </div>

      </div>
    </BrowserRouter>
  );
}