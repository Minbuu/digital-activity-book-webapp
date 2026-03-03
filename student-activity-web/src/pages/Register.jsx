import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    password_confirmation: '',
    first_name: '',
    last_name: '',
    birth_date: '',
    address: '',
    student_id: '',
    department_id: '', // แก้เป็น department_id ให้ตรงกับ Database
    teacher_id: '',
    role: 'teacher'
  });

  // 🆕 State สำหรับเก็บข้อมูล Dropdown ที่ดึงมาจาก API
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // 🆕 ดึงข้อมูลแผนกและอาจารย์เมื่อเปิดหน้านี้
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        // ดึงข้อมูลแผนกวิชา
        const deptResponse = await axios.get('http://192.168.43.186:8000/api/departments');
        setDepartments(deptResponse.data);

        // ดึงข้อมูลอาจารย์
        const teacherResponse = await axios.get('http://192.168.43.186:8000/api/teachers');
        setTeachers(teacherResponse.data);
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
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (formData.password !== formData.password_confirmation) {
      setErrorMsg('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      setIsLoading(false);
      return;
    }

    // ตรวจสอบว่าเลือกแผนกและอาจารย์หรือยัง
    if (!formData.department_id || !formData.teacher_id) {
      setErrorMsg('กรุณาเลือกแผนก/สาขาวิชา และ อาจารย์ที่ปรึกษา ให้ครบถ้วน');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://192.168.43.186:8000/api/register', formData);
      setSuccessMsg(response.data.message || 'สมัครสมาชิกสำเร็จ! กำลังพากลับไปหน้าเข้าสู่ระบบ...');
      
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      console.error(error.response?.data);
      setErrorMsg(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = "w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all";
  const labelStyle = "block text-slate-700 text-sm font-bold mb-1.5";

  return (
    <div className="fixed inset-0 flex bg-white font-sans overflow-hidden">
      
      {/* ส่วนซ้าย: Graphic Background */}
      <div className="hidden md:flex md:w-1/2 lg:w-7/12 h-full bg-gradient-to-br from-blue-600 to-indigo-900 justify-center items-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-10 rounded-full -ml-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-blue-400 opacity-20 rounded-full -mr-32 -mb-32 blur-3xl"></div>
        
        <div className="relative z-10 text-center px-8 lg:px-12 text-white max-w-lg">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">ระบบจัดเก็บ <br/> และติดตามกิจกรรม</h1>
          <p className="text-lg lg:text-xl text-blue-100 font-light opacity-90">
            แพลตฟอร์มที่ช่วยให้นักศึกษาและอาจารย์ จัดการข้อมูลกิจกรรมได้อย่างมีประสิทธิภาพ รวดเร็ว และเป็นระบบ
          </p>
          
          <div className="mt-12 p-6 rounded-2xl bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg border border-white border-opacity-20 shadow-xl">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center opacity-80">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">ลงทะเบียนง่าย & รวดเร็ว</p>
                <p className="text-sm text-blue-200">พร้อมเริ่มต้นใช้งานได้ทันที</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ส่วนขวา: แบบฟอร์ม */}
      <div className="w-full md:w-1/2 lg:w-5/12 h-full bg-white overflow-y-auto">
        <div className="flex flex-col justify-center min-h-full p-8 sm:p-12 lg:p-16">
          <div className="w-full max-w-lg mx-auto">
            
              <div className="mb-10">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm transform -rotate-3">
                <svg className="w-8 h-8 text-blue-600 transform rotate-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">สมัครสมาชิกอาจารย์</h2>
              <p className="text-slate-400 font-bold text-sm">กรอกข้อมูลเพื่อเริ่มต้นสะสมชั่วโมงกิจกรรม</p>
            </div>

            {errorMsg && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-xs font-bold mb-6">
                ⚠️ {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="bg-green-50 border border-green-100 text-green-600 px-4 py-3 rounded-xl text-xs font-bold mb-6">
                ✅ {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* 1. ข้อมูลการเข้าสู่ระบบ */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-[1px] flex-1 bg-blue-100"></div>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">01 ข้อมูลเข้าสู่ระบบ</span>
                  <div className="h-[1px] flex-1 bg-blue-100"></div>
                </div>
                <div className="space-y-4">
                  <input name="username" required placeholder="ชื่อผู้ใช้งาน (Username)" className={inputStyle} onChange={handleChange} />
                  <div className="grid grid-cols-2 gap-4">
                    <input name="password" type="password" required placeholder="รหัสผ่าน" className={inputStyle} onChange={handleChange} />
                    <input name="password_confirmation" type="password" required placeholder="ยืนยันรหัสผ่าน" className={inputStyle} onChange={handleChange} />
                  </div>
                </div>
              </div>

              {/* 2. ข้อมูลส่วนตัว */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-[1px] flex-1 bg-blue-100"></div>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">02 ข้อมูลส่วนตัว</span>
                  <div className="h-[1px] flex-1 bg-blue-100"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input name="first_name" required placeholder="ชื่อจริง" className={inputStyle} onChange={handleChange} />
                  <input name="last_name" required placeholder="นามสกุล" className={inputStyle} onChange={handleChange} />
                </div>
                <input name="birth_date" type="date" required className={inputStyle} onChange={handleChange} />
                <textarea name="address" required placeholder="ที่อยู่ปัจจุบัน..." rows="2" className={`${inputStyle} resize-none`} onChange={handleChange} />
              </div>

              {/* 3. ข้อมูลการศึกษา (Dropdown แบบดึงจาก DB) */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-[1px] flex-1 bg-blue-100"></div>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">03 ข้อมูลการศึกษา</span>
                  <div className="h-[1px] flex-1 bg-blue-100"></div>
                </div>
                <input name="teacher_id" required placeholder="รหัสอาจารย์" className={inputStyle} onChange={handleChange} />
                <select name="department_id" required className={inputStyle} value={formData.department_id} onChange={handleChange}>
                  <option value="">-- เลือกแผนกวิชา --</option>
                  {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                </select>
              </div>

              {/* ปุ่ม Submit */}
              <div className="pt-4 space-y-6">
                <button disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-200 transform hover:scale-[1.01] active:scale-[0.99] disabled:bg-blue-300">
                  {isLoading ? 'กำลังประมวลผล...' : 'ลงทะเบียนบัญชีอาจารย์'}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-600">
                มีบัญชีผู้ใช้งานแล้วใช่ไหม?{' '}
                <Link to="/" className="font-semibold text-blue-600 hover:text-indigo-600 transition duration-150 ease-in-out hover:underline">
                  กลับไปหน้าเข้าสู่ระบบ
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

export default Register;