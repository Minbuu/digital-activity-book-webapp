import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar'; // 👈 ตรวจสอบ path ของ Sidebar ให้ตรงกับโปรเจกต์คุณ

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ totalActivities: 0, totalHours: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!token || !storedUser) {
      navigate('/');
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== 'student') {
        navigate('/teacherdashboard');
        return;
      }
      setUser(parsedUser);
      fetchDashboardStats(token);
    } catch (error) {
      navigate('/');
    }
  }, [navigate]);

  const fetchDashboardStats = async (token) => {
    try {
      const response = await fetch('http://192.168.43.186:8000/api/student/dashboard-stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalActivities: data.total_activities,
          totalHours: data.total_hours,
          teacherName: data.teacher_name // 👈 เพิ่มบรรทัดนี้
        });
        
        if (data.profile) {
          setUser(prev => ({ ...prev, profile: data.profile }));
        }
      }
    } catch (error) {
      console.error('ดึงข้อมูลสถิติผิดพลาด:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return <div className="fixed inset-0 flex items-center justify-center bg-gray-50">กำลังโหลด...</div>;

  return (
    <div className="fixed inset-0 flex bg-gray-50 font-sans overflow-hidden">
      
      {/* ใช้งาน Sidebar ของนักศึกษา */}
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-y-auto pt-16 md:pt-0">
        <div className="flex-1 p-6 md:p-10">
          <div className="max-w-6xl mx-auto space-y-6 pb-10">

            {/* ---------------- 1. ส่วน Header ทักทาย & สรุปตัวเลข ---------------- */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900">
                  สวัสดี, <span className="text-blue-600 uppercase">{user.profile?.first_name || user.name}!</span> 👋
                </h1>
                <p className="text-gray-500 mt-2">ยินดีต้อนรับเข้าสู่หน้าแดชบอร์ดจัดการกิจกรรม</p>
              </div>

              <div className="flex flex-row gap-4 w-full lg:w-auto">
                {/* การ์ด: กิจกรรมที่เข้าร่วม */}
                <div className="bg-blue-50/50 rounded-2xl p-6 flex flex-col items-center justify-center border border-blue-100 flex-1 lg:min-w-[160px]">
                  <span className="text-4xl font-black text-blue-600 mb-1">
                    {isLoading ? '-' : stats.totalActivities}
                  </span>
                  <span className="text-sm font-semibold text-blue-700">กิจกรรมที่เข้าร่วม</span>
                </div>

                {/* การ์ด: ชั่วโมงกิจกรรมสะสม */}
                <div className="bg-green-50/50 rounded-2xl p-6 flex flex-col items-center justify-center border border-green-100 flex-1 lg:min-w-[160px]">
                  <span className="text-4xl font-black text-green-600 mb-1">
                    {isLoading ? '-' : stats.totalHours}
                  </span>
                  <span className="text-sm font-semibold text-green-700 text-center leading-tight">ชั่วโมงกิจกรรม<br/>สะสม</span>
                </div>
              </div>
            </div>

            {/* ---------------- 2. ส่วนข้อมูลด้านล่าง ---------------- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* ข้อมูลนักศึกษา */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">ข้อมูลนักศึกษา</h2>
                <div className="space-y-5">
                  <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                    <span className="text-gray-500 font-medium text-sm">รหัสนักศึกษา:</span>
                    <span className="text-gray-900 font-semibold">{user.profile?.student_id || 'ไม่ระบุ'}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                    <span className="text-gray-500 font-medium text-sm">แผนกวิชา:</span>
                    <span className="text-gray-900 font-semibold">{user.profile?.department?.name || 'ไม่ระบุ'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium text-sm">อาจารย์ที่ปรึกษา:</span>
                    <span className={`font-semibold ${stats.teacherName ? 'text-gray-900' : 'text-yellow-600'}`}>
                      {stats.teacherName 
                        ? `อ.${stats.teacherName}` 
                        : 'กำลังตรวจสอบ'}
                    </span>
                  </div>
                </div>
              </div>

              {/* กิจกรรมที่กำลังจะมาถึง */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center min-h-[240px]">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium mb-3">ยังไม่มีกิจกรรมที่กำลังจะมาถึง</p>
                {/* 💡 ลิงก์ไปยังหน้าค้นหากิจกรรม (ถ้ามีหน้ากิจกรรมรวมให้เปลี่ยน path ตรง to="/...") */}
                <Link to="/activities" className="text-blue-600 font-bold hover:text-blue-800 transition-colors text-sm flex items-center">
                  ค้นหากิจกรรมเลย 
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </Link>
              </div>

            </div>

          </div>
        </div>
      </main>

    </div>
  );
};

export default StudentDashboard;