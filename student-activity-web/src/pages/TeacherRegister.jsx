import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const TeacherRegister = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    password_confirmation: '',
    first_name: '',
    last_name: '',
    birth_date: '',
    address: '',
    department_id: '',
    staff_id: '', // 👈 แก้จาก teacher_id เป็น staff_id
    role: 'teacher'
});

  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  // ดึงข้อมูลตัวเลือกจาก API
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        // ปรับเป็น localhost ตามมาตรฐานการพัฒนาของคุณ
        const [deptRes, teacherRes] = await Promise.all([
          axios.get('http://localhost:8000/api/departments')
        ]);
        setDepartments(deptRes.data);
        setTeachers(teacherRes.data);
      } catch (error) {
        console.error('ดึงข้อมูลตัวเลือกไม่สำเร็จ:', error);
      }
    };
    fetchDropdownData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirmation) {
      return setErrorMsg('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
    }
    
    setIsLoading(true);
    try {
      const response = await axios.post('http://192.168.43.186:8000/api/register/teacher', formData);
      alert(response.data.message || 'สมัครสมาชิกสำเร็จ!');
      navigate('/');
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'เกิดข้อผิดพลาดในการลงทะเบียน');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex bg-white font-sans overflow-hidden">
      
      {/* ---------------- ฝั่งซ้าย: Brand Section (Blue Immersive) ---------------- */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-700 to-indigo-900 text-white flex-col justify-center items-center p-20 relative">
        <div className="z-10 text-left space-y-6 max-w-sm">
          <h1 className="text-4xl font-black leading-tight tracking-tight uppercase">
            ระบบจัดเก็บ<br />และติดตามกิจกรรม
          </h1>
          <p className="text-blue-100/80 text-sm font-bold leading-relaxed">
            บันทึกชั่วโมงจิตอาสา ติดตามสถานะการอนุมัติ และตรวจสอบความก้าวหน้าของคุณได้ในที่เดียว
          </p>
          <div className="pt-6">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-lg font-black text-xs">ST</div>
              <p className="text-left text-[10px] font-black uppercase tracking-widest leading-tight">Student<br/>Registration</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mt-32 blur-3xl"></div>
      </div>

      {/* ---------------- ฝั่งขวา: Registration Form ---------------- */}
      <div className="w-full lg:w-1/2 h-full flex flex-col bg-white overflow-y-auto custom-scrollbar">
        <div className="flex-1 flex flex-col items-center py-12 px-8 md:px-16">
          <div className="max-w-md w-full">
            
            <div className="text-left mb-10">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 border border-blue-100 shadow-sm">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">สมัครสมาชิกอาจารย์</h2>
              <p className="text-slate-400 mt-2 font-bold text-sm">กรอกข้อมูลเพื่อเริ่มต้นสะสมชั่วโมงกิจกรรม</p>
            </div>

            {errorMsg && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-xs font-bold mb-6">
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* 01 ข้อมูลบัญชี */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-[1px] flex-1 bg-blue-100"></div>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">01 ข้อมูลเข้าสู่ระบบ</span>
                  <div className="h-[1px] flex-1 bg-blue-100"></div>
                </div>
                <div className="space-y-4">
                  <input name="username" required placeholder="ชื่อผู้ใช้งาน (Username)" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" onChange={handleChange} />
                  <div className="grid grid-cols-2 gap-4">
                    <input name="password" type="password" required placeholder="รหัสผ่าน" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" onChange={handleChange} />
                    <input name="password_confirmation" type="password" required placeholder="ยืนยันรหัสผ่าน" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" onChange={handleChange} />
                  </div>
                </div>
              </div>

              {/* 02 ข้อมูลส่วนตัว */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-[1px] flex-1 bg-blue-100"></div>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">02 ข้อมูลส่วนตัว</span>
                  <div className="h-[1px] flex-1 bg-blue-100"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input name="first_name" required placeholder="ชื่อจริง" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" onChange={handleChange} />
                  <input name="last_name" required placeholder="นามสกุล" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" onChange={handleChange} />
                </div>
                <input name="birth_date" type="date" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" onChange={handleChange} />
                <textarea name="address" required placeholder="ที่อยู่ปัจจุบัน..." rows="2" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none" onChange={handleChange} />
              </div>

              {/* 03 ข้อมูลอาจารย์ */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-[1px] flex-1 bg-blue-100"></div>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">03 ข้อมูลการศึกษา</span>
                  <div className="h-[1px] flex-1 bg-blue-100"></div>
                </div>
                <input name="staff_id" required placeholder="รหัสอาจารย์" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" onChange={handleChange} />
                <select name="department_id" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer" value={formData.department_id} onChange={handleChange}>
                  <option value="">-- เลือกแผนกวิชา --</option>
                  {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                </select>
                
              </div>

              <div className="pt-4 space-y-6">
                <button disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-200 transform hover:scale-[1.01] active:scale-[0.99] disabled:bg-blue-300">
                  {isLoading ? 'กำลังประมวลผล...' : 'ลงทะเบียนบัญชีอาจารย์'}
                </button>
                <div className="text-center pb-8">
                  <span className="text-xs text-slate-400 font-bold">มีบัญชีผู้ใช้งานแล้ว? </span>
                  <Link to="/" className="text-xs font-black text-blue-600 hover:text-blue-800 transition-colors underline decoration-2 underline-offset-4 uppercase">
                    เข้าสู่ระบบ
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

    </div>
  );
};

export default TeacherRegister;