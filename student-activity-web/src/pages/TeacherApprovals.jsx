import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherSidebar from '../components/TeacherSidebar';

const TeacherApprovals = () => {
  const [user, setUser] = useState(null);
  const [pendingActivities, setPendingActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null); // สำหรับทำ Loading ที่ปุ่มตอนกดอนุมัติ
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
      if (parsedUser.role !== 'teacher') {
        navigate('/');
        return;
      }
      setUser(parsedUser);
      fetchPendingApprovals(token);
    } catch (error) {
      navigate('/');
    }
  }, [navigate]);

  const fetchPendingApprovals = async (token) => {
    try {
      const response = await fetch('http://192.168.43.186:8000/api/teacher/approvals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPendingActivities(data);
      }
    } catch (error) {
      console.error('ดึงข้อมูลผิดพลาด:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setProcessingId(id); // เปลี่ยนปุ่มเป็นสถานะกำลังโหลด
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://192.168.43.186:8000/api/teacher/approvals/${id}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        // ดึงข้อมูลใหม่เพื่ออัปเดตหน้าจอ (หรือลบรายการนี้ออกจาก State ทันที)
        setPendingActivities(prev => prev.filter(activity => activity.id !== id));
      } else {
        alert('เกิดข้อผิดพลาดในการอนุมัติ');
      }
    } catch (error) {
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setProcessingId(null);
    }
  };

  if (!user) return <div className="fixed inset-0 flex items-center justify-center bg-gray-50 text-gray-500">กำลังโหลด...</div>;

  return (
    <div className="fixed inset-0 flex bg-gray-50 font-sans overflow-hidden">
      
      <TeacherSidebar user={user} />

      <main className="flex-1 flex flex-col h-full overflow-hidden pt-16 md:pt-0">
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-6xl mx-auto space-y-6 pb-10">

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200 pb-6">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900">กิจกรรมรอการอนุมัติ</h1>
                <p className="text-gray-500 mt-2">รายการกิจกรรมที่นักศึกษาส่งเข้ามาและรออาจารย์ตรวจสอบ</p>
              </div>
              <div className="bg-yellow-50 text-yellow-700 px-4 py-2 rounded-xl font-bold border border-yellow-200 shadow-sm">
                รออนุมัติ: {pendingActivities.length} รายการ
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <p className="text-gray-500 font-medium">กำลังโหลดข้อมูล...</p>
              </div>
            ) : pendingActivities.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center mt-6">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">เยี่ยมมาก! ไม่มีงานค้าง</h3>
                <p className="text-gray-500">นักศึกษาในที่ปรึกษาของคุณได้รับการอนุมัติกิจกรรมครบถ้วนแล้ว</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {pendingActivities.map((activity) => (
                  <div key={activity.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow">
                    
                    {/* ข้อมูลนักศึกษา */}
                    <div className="flex items-center mb-4 pb-4 border-b border-gray-50">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg mr-4">
                        {activity.student_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{activity.student_name}</p>
                        <p className="text-xs text-gray-500 font-medium tracking-wider">รหัส: {activity.student_id}</p>
                      </div>
                    </div>

                    {/* ข้อมูลกิจกรรม */}
                    <div className="flex-1 space-y-3 mb-6">
                      <h3 className="font-bold text-blue-700 text-lg line-clamp-2 leading-tight">{activity.title}</h3>
                      <div className="text-sm text-gray-600 space-y-1.5 bg-gray-50 p-3 rounded-xl">
                        <p><span className="font-semibold text-gray-800">หมวดหมู่:</span> {activity.category}</p>
                        <p><span className="font-semibold text-gray-800">วันที่:</span> {activity.date ? new Date(activity.date).toLocaleDateString('th-TH') : '-'}</p>
                        <p><span className="font-semibold text-gray-800">สถานที่:</span> {activity.location || 'ไม่ระบุ'}</p>
                      </div>
                    </div>

                    {/* ปุ่ม Action */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <span className="flex items-center text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
                        ⏳ {activity.hours} ชั่วโมง
                      </span>
                      <button 
                        onClick={() => handleApprove(activity.id)}
                        disabled={processingId === activity.id}
                        className={`flex items-center px-5 py-2.5 rounded-xl font-bold text-white transition-all shadow-sm ${
                          processingId === activity.id 
                            ? 'bg-blue-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md transform hover:-translate-y-0.5'
                        }`}
                      >
                        {processingId === activity.id ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            กำลังอนุมัติ...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                            อนุมัติกิจกรรม
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </main>

    </div>
  );
};

export default TeacherApprovals;