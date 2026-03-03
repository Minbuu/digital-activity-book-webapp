import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherSidebar from '../components/TeacherSidebar';

const TeacherProfile = () => {
  const [user, setUser] = useState(null);
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
      // ตรวจสอบสิทธิ์ ต้องเป็นอาจารย์เท่านั้น
      if (parsedUser.role !== 'teacher') {
        navigate('/');
        return;
      }
      setUser(parsedUser);
    } catch (error) {
      navigate('/');
    }
  }, [navigate]);

  if (!user) return <div className="fixed inset-0 flex items-center justify-center bg-gray-50 text-gray-500">กำลังโหลด...</div>;

  return (
    <div className="fixed inset-0 flex bg-gray-50 font-sans overflow-hidden">
      
      {/* Sidebar ของอาจารย์ */}
      <TeacherSidebar user={user} />

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
                  <label className="text-sm font-semibold text-gray-500 block mb-1">ชื่อ-นามสกุล</label>
                  <div className="flex items-center text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                    <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    {user.profile?.first_name && user.profile?.last_name ? `${user.profile.first_name} ${user.profile.last_name}` : 'ไม่ระบุชื่อ'}
                  </div>
                </div>
                {/* วันเกิด */}
                <div>
                  <label className="text-sm font-semibold text-gray-500 block mb-1">วัน/เดือน/ปี เกิด</label>
                  <div className="flex items-center text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                    <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {user.profile?.birth_date ? new Date(user.profile.birth_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : 'ไม่ระบุ'}
                  </div>
                </div>
                {/* ที่อยู่ */}
                <div>
                  <label className="text-sm font-semibold text-gray-500 block mb-1">ที่อยู่</label>
                  <div className="flex items-center text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                    <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {user.profile?.address || 'ไม่ระบุที่อยู่'}
                  </div>
                </div>


                {/* แผนกวิชา */}
                <div>
                  <label className="text-sm font-semibold text-gray-500 block mb-1">แผนกวิชา / สาขา</label>
                  <div className="flex items-center text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                    <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    {user.profile?.department?.name || 'ไม่ระบุ'}
                  </div>
                </div>


                {/* บทบาท */}
                <div>
                  <label className="text-sm font-semibold text-gray-500 block mb-1">ระดับสิทธิ์ (Role)</label>
                  <div className="flex items-center text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                    <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    <span className="font-bold text-blue-600 uppercase tracking-wider">{user.role}</span>
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

export default TeacherProfile;