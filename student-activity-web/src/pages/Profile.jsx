import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
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
      // เราใช้ API dashboard-stats เพื่อดึงข้อมูลแผนกและชื่ออาจารย์ที่อัปเดตล่าสุด
      fetchProfileData(token);
    } catch (error) {
      navigate('/');
    }
  }, [navigate]);

  const fetchProfileData = async (token) => {
    try {
      const response = await fetch('http://localhost:8000/api/student/dashboard-stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        if (data.profile) {
          setUser(prev => ({ ...prev, profile: data.profile }));
        }
      }
    } catch (error) {
      console.error('ดึงข้อมูลผิดพลาด:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || isLoading) return <div className="fixed inset-0 flex items-center justify-center bg-gray-50 text-gray-500 font-bold">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="fixed inset-0 flex bg-gray-50 font-sans overflow-hidden">
      
      {/* ใช้งาน Sidebar ของนักศึกษา */}
      <Sidebar />

      {/* ---------------- Main Content ---------------- */}
      <main className="flex-1 flex flex-col h-full overflow-hidden pt-16 md:pt-0">
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-4xl mx-auto space-y-8 pb-10">

            {/* Header */}
            <div className="border-b border-gray-200 pb-6">
              <h1 className="text-3xl font-extrabold text-gray-900">ข้อมูลส่วนตัว</h1>
              <p className="text-gray-500 mt-2">จัดการข้อมูลพื้นฐานและรายละเอียดบัญชีของคุณ</p>
            </div>

            

            {/* ข้อมูลรายละเอียด (ส่วนล่าง) */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6">รายละเอียดบัญชี</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                
                {/* ชื่อ-นามสกุล */}
                <div>
                  <label className="text-sm font-bold text-gray-500 block mb-1">ชื่อ-นามสกุล</label>
                  <div className="flex items-center text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 font-semibold">
                    <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    {user.profile?.first_name && user.profile?.last_name ? `${user.profile.first_name} ${user.profile.last_name}` : 'ไม่ระบุชื่อ'}
                  </div>
                </div>

                {/* วันเดือนปีเกิด */}
                <div>
                  <label className="text-sm font-bold text-gray-500 block mb-1">วันเดือนปีเกิด</label>
                  <div className="flex items-center text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 font-semibold">
                    <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    {user.profile?.birth_date || 'ไม่ระบุวันเกิด'}
                  </div>
                </div>

                {/* ที่อยู่ */}
                <div>
                  <label className="text-sm font-bold text-gray-500 block mb-1">ที่อยู่</label>
                  <div className="flex items-center text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 font-semibold">
                    <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    {user.profile?.address || 'ไม่ระบุที่อยู่'}
                  </div>
                </div>
                  

                {/* รหัสนักศึกษา */}
                <div>
                  <label className="text-sm font-bold text-gray-500 block mb-1">รหัสนักศึกษา</label>
                  <div className="flex items-center text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 font-semibold">
                    <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                    {user.profile?.student_id || 'ไม่ระบุรหัส'}
                  </div>
                </div>

                

                {/* แผนกวิชา */}
                <div>
                  <label className="text-sm font-bold text-gray-500 block mb-1">แผนกวิชา / สาขา</label>
                  <div className="flex items-center text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 font-semibold">
                    <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    {user.profile?.department?.name || 'ไม่ระบุ'}
                  </div>
                </div>

                {/* อาจารย์ที่ปรึกษา */}
                <div>
                  <label className="text-sm font-bold text-gray-500 block mb-1">อาจารย์ที่ปรึกษา</label>
                  <div className="flex items-center text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 font-semibold">
                    <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    {stats?.teacher_name ? `อ.${stats.teacher_name}` : 'กำลังตรวจสอบ'}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>

    </div>
  );
};

export default Profile;