import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const TeacherSidebar = ({ user }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('http://192.168.43.186:8000/api/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการออกจากระบบ:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setShowLogoutModal(false);
      navigate('/');
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'หน้าแรก', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', link: '/teacherdashboard' },
    { id: 'students', label: 'รายชื่อนักศึกษา', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', link: '/teacher/students' },
    { id: 'approvals', label: 'อนุมัติกิจกรรมนักศึกษา', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', link: '/teacher/approvals' },
    { id: 'scan-qr', label: 'สแกน QR ยืนยันกิจกรรม', icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z', link: '/teacher/scan' },
    { id: 'verify-students', label: 'ยืนยันนักศึกษาใหม่', icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z', link: '/teacher/verify-students' },
    { id: 'profile', label: 'ข้อมูลส่วนตัว', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', link: '/teacher/profile' },
  ];

  const renderSidebarContent = () => (
    <>
      <div className="h-16 md:h-20 flex items-center px-6 md:px-8 border-b border-slate-800 flex-shrink-0">
        <svg className="w-8 h-8 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <span className="font-bold text-lg tracking-wide">Teacher Panel</span>
      </div>

      <div className="p-6 border-b border-slate-800 flex flex-col items-center text-center flex-shrink-0">
        <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold mb-3 shadow-inner">
          {user?.profile?.first_name?.charAt(0) || 'T'}
        </div>
        <p className="font-semibold text-slate-100">อ.{user?.profile?.first_name} {user?.profile?.last_name}</p>
        <p className="text-xs text-blue-300 mt-1">{user?.profile?.department?.name || 'อาจารย์ที่ปรึกษา'}</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.link;
          return (
            <Link 
              key={item.id} 
              to={item.link} 
              onClick={() => setIsMobileMenuOpen(false)} 
              className={`flex items-center px-4 py-3 rounded-xl transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white font-semibold shadow-md' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white font-medium'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 flex-shrink-0">
        <button 
          onClick={() => { setIsMobileMenuOpen(false); setShowLogoutModal(true); }} 
          className="flex items-center w-full px-4 py-3 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-colors font-medium text-sm"
        >
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          ออกจากระบบ
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ---------------- Modal ยืนยันการออกจากระบบ ---------------- */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 transform transition-all">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-50 mb-5">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">ยืนยันการออกจากระบบ</h3>
              <p className="text-sm text-gray-500 mb-6">คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ? คุณจะต้องเข้าสู่ระบบใหม่ในครั้งถัดไป</p>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 px-4 py-3 sm:py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl transition-colors">ยกเลิก</button>
              <button onClick={handleLogout} className="flex-1 px-4 py-3 sm:py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors shadow-md">ยืนยัน</button>
            </div>
          </div>
        </div>
      )}

      {/* 💻 Desktop Sidebar (ซ่อนในมือถือ) */}
      <aside className="w-64 bg-slate-900 shadow-xl flex flex-col z-10 hidden md:flex h-full text-white">
        {renderSidebarContent()}
      </aside>

      {/* 📱 Mobile Navbar (แสดงเฉพาะมือถือ) */}
      <header className="h-16 bg-slate-900 shadow-sm flex items-center justify-between px-4 sm:px-6 md:hidden z-20 absolute top-0 w-full text-white">
        <div className="font-bold text-blue-400 text-lg">Teacher Panel</div>
        
        {/* 🛠️ เอาปุ่มออกจากระบบออก เหลือแค่ไอคอนแฮมเบอร์เกอร์ */}
        <div className="flex items-center">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -mr-2 text-slate-300 hover:text-white focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* 📱 Mobile Sidebar Overlay (สไลด์ออกมาเมื่อกด Hamburger) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end md:hidden">
          
          {/* ฉากหลังสีดำโปร่งแสง (คลิกพื้นที่ว่างเพื่อปิด) */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          {/* เมนูที่สไลด์ออกมาจากขวา */}
          <div className="relative flex flex-col max-w-[260px] w-full bg-slate-900 text-white shadow-2xl h-full animate-fade-in">
            <div className="absolute top-0 left-0 -ml-12 pt-3">
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="mr-1 flex items-center justify-center h-10 w-10 rounded-full bg-slate-800 text-white focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            {/* เรียกใช้เนื้อหาเมนูที่สร้างไว้ */}
            {renderSidebarContent()}
          </div>
        </div>
      )}
    </>
  );
};

export default TeacherSidebar;