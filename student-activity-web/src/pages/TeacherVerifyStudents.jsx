import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherSidebar from '../components/TeacherSidebar';

const TeacherVerifyStudents = () => {
  const [user, setUser] = useState(null);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
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
      if (parsedUser.role !== 'teacher') return navigate('/');
      setUser(parsedUser);
      fetchPendingStudents(token);
    } catch (error) { navigate('/'); }
  }, [navigate]);

  const fetchPendingStudents = async (token) => {
    try {
      const response = await fetch('http://192.168.43.186:8000/api/teacher/pending-students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setPendingStudents(await response.json());
      }
    } catch (error) { console.error(error); } 
    finally { setIsLoading(false); }
  };

  const handleVerify = async (id) => {
    if(!window.confirm('ยืนยันรับนักศึกษาคนนี้เข้าที่ปรึกษาใช่หรือไม่?')) return;
    
    setProcessingId(id);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://192.168.43.186:8000/api/teacher/verify-student/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        // ลบนักศึกษาคนนี้ออกจากหน้าจอทันที (เพราะอนุมัติไปแล้ว)
        setPendingStudents(prev => prev.filter(student => student.user_id !== id));
      } else {
        alert('เกิดข้อผิดพลาดในการยืนยันตัวตน');
      }
    } catch (error) { alert('เชื่อมต่อเซิร์ฟเวอร์ล้มเหลว'); } 
    finally { setProcessingId(null); }
  };

  if (!user) return <div className="fixed inset-0 flex items-center justify-center bg-gray-50">กำลังโหลด...</div>;

  return (
    <div className="fixed inset-0 flex bg-gray-50 font-sans overflow-hidden">
      <TeacherSidebar user={user} />

      <main className="flex-1 flex flex-col h-full overflow-hidden pt-16 md:pt-0">
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-5xl mx-auto space-y-6 pb-10">

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200 pb-6">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900">นักศึกษาใหม่รอยืนยัน</h1>
                <p className="text-gray-500 mt-2">นักศึกษาที่เพิ่งสมัครสมาชิกและเลือกคุณเป็นที่ปรึกษา</p>
              </div>
              <div className="bg-yellow-50 text-yellow-700 px-4 py-2 rounded-xl font-bold border border-yellow-200 shadow-sm">
                รอยืนยัน: {pendingStudents.length} คน
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20"><p className="text-gray-500 font-medium">กำลังโหลด...</p></div>
            ) : pendingStudents.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center mt-6">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">ไม่มีคำขอใหม่</h3>
                <p className="text-gray-500">คุณได้ยืนยันตัวตนนักศึกษาครบหมดแล้ว</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {pendingStudents.map((student) => (
                  <div key={student.user_id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col hover:border-blue-300 transition-colors">
                    <div className="flex items-center mb-4 pb-4 border-b border-gray-50">
                      <div className="w-14 h-14 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center font-bold text-xl mr-4">
                        {student.first_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-lg">{student.first_name} {student.last_name}</p>
                        <p className="text-sm text-gray-500 font-medium">รหัส: {student.student_id}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-6 space-y-1">
                      <p><span className="font-semibold text-gray-800">อีเมล:</span> {student.email}</p>
                      <p><span className="font-semibold text-gray-800">สมัครเมื่อ:</span> {new Date(student.registered_at).toLocaleDateString('th-TH')}</p>
                    </div>
                    <button 
                      onClick={() => handleVerify(student.user_id)}
                      disabled={processingId === student.user_id}
                      className="mt-auto w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-sm flex items-center justify-center"
                    >
                      {processingId === student.user_id ? 'กำลังอนุมัติ...' : 'อนุมัติรับเข้าที่ปรึกษา'}
                    </button>
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

export default TeacherVerifyStudents;