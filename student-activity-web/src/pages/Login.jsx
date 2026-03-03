import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg(''); 
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('http://192.168.43.186:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        // alert('เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับ ' + data.user.profile.first_name);
        const userRole = data.user.role;
        // 2. เช็ค Role เพื่อแยกทางไป Dashboard
        if (userRole === 'teacher') {
            navigate('/teacherdashboard'); // ไปหน้าอาจารย์
        } else if (userRole === 'admin') {
            navigate('/admindashboard');   // ไปหน้าแอดมิน (อนาคต)
        } else {
            navigate('/studentdashboard'); // ไปหน้านักศึกษา
        }
      } else {
        setErrorMsg(data.message || 'ข้อมูลเข้าสู่ระบบไม่ถูกต้อง');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ในขณะนี้');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // จุดแก้สำคัญ: เปลี่ยนจาก flex h-screen เป็น fixed inset-0 flex เพื่อตรึงขอบทั้ง 4 ด้านติดหน้าจอเบราว์เซอร์เป๊ะๆ
    <div className="fixed inset-0 flex bg-white font-sans overflow-hidden">
      
      {/* ส่วนซ้าย: Graphic Background */}
      <div className="hidden md:flex md:w-1/2 lg:w-7/12 h-full bg-gradient-to-br from-blue-600 to-indigo-900 justify-center items-center relative overflow-hidden">
        
        {/* วงกลมตกแต่งให้ดูมีมิติ */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-10 rounded-full -ml-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-blue-400 opacity-20 rounded-full -mr-32 -mb-32 blur-3xl"></div>
        
        <div className="relative z-10 text-center px-8 lg:px-12 text-white max-w-lg">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">ระบบจัดเก็บ <br/> และติดตามกิจกรรม</h1>
          <p className="text-lg lg:text-xl text-blue-100 font-light opacity-90">
            แพลตฟอร์มที่ช่วยให้นักศึกษาและอาจารย์ จัดการข้อมูลกิจกรรมได้อย่างมีประสิทธิภาพ รวดเร็ว และเป็นระบบ
          </p>
          
          {/* Glassmorphism Mockup */}
          <div className="mt-12 p-6 rounded-2xl bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg border border-white border-opacity-20 shadow-xl">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center opacity-80">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">ปลอดภัย & เชื่อถือได้</p>
                <p className="text-sm text-blue-200">เข้ารหัสข้อมูลการใช้งานระดับสูง</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ส่วนขวา: แบบฟอร์ม Login */}
      <div className="w-full md:w-1/2 lg:w-5/12 h-full flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          
          <div className="mb-10">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm transform -rotate-3">
              <svg className="w-8 h-8 text-blue-600 transform rotate-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">ยินดีต้อนรับกลับมา!</h2>
            <p className="text-gray-500 font-medium">เข้าสู่ระบบจัดการกิจกรรมนักศึกษา</p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-md flex items-start shadow-sm" role="alert">
              <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="block sm:inline text-sm font-medium">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="username">
                ชื่อผู้ใช้งาน
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input 
                  id="username" name="username" type="text" placeholder="Username" 
                  value={credentials.username} onChange={handleChange} 
                  className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200" required 
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-gray-700 text-sm font-semibold" htmlFor="password">
                  รหัสผ่าน
                </label>
                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors">
                  ลืมรหัสผ่าน?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                
                <input 
                  id="password" name="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={credentials.password} onChange={handleChange} 
                  className="w-full pl-10 pr-12 py-3.5 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200" required 
                />
                
                <button 
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-base font-bold text-white transition-all duration-200 mt-2 ${
                isLoading 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                'เข้าสู่ระบบ'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              ยังไม่มีบัญชีใช่หรือไม่?{' '}
              <Link to="/register" className="font-semibold text-blue-600 hover:text-indigo-600 transition duration-150 ease-in-out hover:underline">
                สมัครสมาชิกนักศึกษาที่นี่
              </Link>
            </p>
            
            <p className="text-sm text-gray-600">
              ยังไม่มีบัญชีใช่หรือไม่?{' '}
              <Link to="/teacher/register" className="font-semibold text-blue-600 hover:text-indigo-600 transition duration-150 ease-in-out hover:underline">
                สมัครสมาชิกอาจารย์ที่นี่
              </Link>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Login;