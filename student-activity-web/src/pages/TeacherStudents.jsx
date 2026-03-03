import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import TeacherSidebar from '../components/TeacherSidebar';

const TeacherStudents = () => {
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
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
      if (parsedUser.role !== 'teacher') {
        navigate('/');
        return;
      }
      setUser(parsedUser);
      fetchStudents(token);
    } catch (error) {
      navigate('/');
    }
  }, [navigate]);

  const fetchStudents = async (token) => {
    try {
      const response = await fetch('http://192.168.43.186:8000/api/teacher/students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('ดึงข้อมูลผิดพลาด:', error);
    } finally {
      setIsLoading(false);
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
                <h1 className="text-3xl font-extrabold text-gray-900">นักศึกษาในที่ปรึกษา</h1>
                <p className="text-gray-500 mt-2">รายชื่อนักศึกษาและชั่วโมงกิจกรรมจิตอาสาสะสม</p>
              </div>
              <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-bold border border-indigo-200 shadow-sm">
                ทั้งหมด: {students.length} คน
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <p className="text-gray-500 font-medium">กำลังโหลดข้อมูลนักศึกษา...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center mt-6">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">ยังไม่มีนักศึกษาในที่ปรึกษา</h3>
                <p className="text-gray-500">ให้นักศึกษาสมัครสมาชิกและเลือกคุณเป็นอาจารย์ที่ปรึกษา</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                
                {/* 🛠️ แก้ไขให้เป็น <Link> ครอบการ์ดอย่างถูกต้อง ไม่มีแท็กเกินแล้ว */}
                {students.map((student) => (
                  <Link 
                    key={student.id} 
                    to={`/teacher/student/${student.id}`}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md hover:border-blue-300 transition-all relative overflow-hidden cursor-pointer group"
                  >
                    <div className="absolute top-0 right-0 bg-blue-500 w-1.5 h-full group-hover:bg-blue-600 transition-colors"></div>
                    <div className="flex items-center mb-4">
                      <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl mr-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        {student.first_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-lg group-hover:text-blue-700 transition-colors">{student.first_name} {student.last_name}</p>
                        <p className="text-sm text-gray-500 font-medium tracking-wider">รหัส: {student.student_id}</p>
                      </div>
                    </div>
                    <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
                      <span className="text-sm text-gray-500 font-medium">กิจกรรมสะสม</span>
                      <span className="flex items-center text-sm font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                        {student.approved_hours} ชั่วโมง
                      </span>
                    </div>
                  </Link>
                ))}

              </div>
            )}

          </div>
        </div>
      </main>

    </div>
  );
};

export default TeacherStudents;