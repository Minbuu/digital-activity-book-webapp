import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import TeacherSidebar from '../components/TeacherSidebar';

const TeacherStudentDetails = () => {
  const [user, setUser] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();
  const { id } = useParams(); // 👈 ดึง ID นักศึกษาจาก URL

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!token || !storedUser) {
      navigate('/');
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== 'teacher') return navigate('/');
      setUser(parsedUser);
      fetchStudentDetails(token, id);
    } catch (error) { navigate('/'); }
  }, [navigate, id]);

  const fetchStudentDetails = async (token, studentId) => {
    try {
      const response = await fetch(`http://192.168.43.186:8000/api/teacher/student/${studentId}/activities`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setStudentData(await response.json());
      } else {
        alert('ไม่พบข้อมูลนักศึกษา');
        navigate('/teacher/students');
      }
    } catch (error) { 
      console.error(error); 
    } finally { 
      setIsLoading(false); 
    }
  };

  if (!user) return <div className="fixed inset-0 bg-gray-50 flex items-center justify-center">กำลังโหลด...</div>;

  return (
    <div className="fixed inset-0 flex bg-gray-50 font-sans overflow-hidden">
      <TeacherSidebar user={user} />

      <main className="flex-1 flex flex-col h-full overflow-hidden pt-16 md:pt-0">
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-5xl mx-auto space-y-6 pb-10">

            {/* ปุ่มย้อนกลับ & Header */}
            <div className="border-b border-gray-200 pb-6">
              <Link to="/teacher/students" className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 mb-4 transition-colors">
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                กลับไปหน้ารายชื่อนักศึกษา
              </Link>
              
              {isLoading ? (
                <div className="h-10 bg-gray-200 w-1/3 rounded animate-pulse"></div>
              ) : (
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
                    {studentData?.student.first_name.charAt(0)}
                  </div>
                  <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">{studentData?.student.first_name} {studentData?.student.last_name}</h1>
                    <p className="text-gray-500 font-medium tracking-wider mt-1">รหัสนักศึกษา: {studentData?.student.student_id}</p>
                  </div>
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20"><p className="text-gray-500 font-medium">กำลังโหลดข้อมูล...</p></div>
            ) : (
              <>
                {/* สรุปสถิติ (Stats Cards) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-green-100 border-l-4 border-l-green-500">
                    <p className="text-sm font-bold text-green-600 mb-1">กิจกรรมที่อนุมัติแล้ว (เซ็นแล้ว)</p>
                    <p className="text-3xl font-black text-gray-800">{studentData.stats.approved_count} <span className="text-sm font-medium text-gray-500">รายการ</span></p>
                    <p className="text-xs text-green-700 bg-green-50 inline-block px-2 py-1 rounded mt-2">สะสม {studentData.stats.approved_hours} ชั่วโมง</p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-yellow-100 border-l-4 border-l-yellow-400">
                    <p className="text-sm font-bold text-yellow-600 mb-1">กิจกรรมรอการอนุมัติ (ยังไม่เซ็น)</p>
                    <p className="text-3xl font-black text-gray-800">{studentData.stats.pending_count} <span className="text-sm font-medium text-gray-500">รายการ</span></p>
                    {studentData.stats.pending_count > 0 && (
                      <Link to="/teacher/approvals" className="text-xs text-blue-600 hover:underline mt-2 inline-block">ไปหน้าอนุมัติ &rarr;</Link>
                    )}
                  </div>
                </div>

                {/* รายการกิจกรรมทั้งหมด */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-8">
                  <div className="bg-slate-50 border-b border-gray-100 px-6 py-4">
                    <h3 className="font-bold text-gray-800 text-lg">ประวัติกิจกรรมทั้งหมด</h3>
                  </div>
                  
                  {studentData.activities.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">นักศึกษาคนนี้ยังไม่มีประวัติการทำกิจกรรม</div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {studentData.activities.map((activity) => (
                        <div key={activity.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-bold text-gray-900 text-lg">{activity.title}</h4>
                              {activity.is_approved ? (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">เซ็นแล้ว ✅</span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">รอเซ็น ⏳</span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center text-sm text-gray-500 gap-x-4 gap-y-1 mt-2">
                              <span className="flex items-center">📅 {new Date(activity.date).toLocaleDateString('th-TH')}</span>
                              <span className="flex items-center">📍 {activity.location}</span>
                            </div>
                          </div>
                          
                          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap border border-blue-100">
                            {activity.hours} ชั่วโมง
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherStudentDetails;