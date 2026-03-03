import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const [user, setUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // 🆕 State สำหรับแฮมเบอร์เกอร์เมนู
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

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
    { id: 'dashboard', label: 'หน้าแรก', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', link: '/studentdashboard' },
    { id: 'activities', label: 'กิจกรรมของฉัน', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', link: '/activities' },
    { id: 'profile', label: 'ข้อมูลส่วนตัว', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', link: '/profile' },
  ];

  // ---------------- ฟังก์ชันสร้างเนื้อหาเมนู (ใช้ร่วมกันทั้ง Desktop และ Mobile) ----------------
  const renderSidebarContent = () => (
    <>
      {/* Header โลโก้ */}
      <div className="h-16 md:h-20 bg-blue-600 flex items-center justify-center flex-shrink-0">
        <span className="font-black text-xl text-white tracking-widest uppercase">Activity Sys</span>
      </div>

      {/* ข้อมูลโปรไฟล์ */}
      <div className="p-6 border-b border-gray-100 flex flex-col items-center text-center flex-shrink-0">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mb-3 shadow-sm border border-blue-100">
          {user?.profile?.first_name?.charAt(0) || user?.name?.charAt(0) || 'U'}
        </div>
        <p className="font-bold text-gray-900">{user?.profile?.first_name || user?.name} {user?.profile?.last_name || ''}</p>
        <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">Student</p>
      </div>

      {/* เมนูนำทาง */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.link;
          return (
            <Link 
              key={item.id} 
              to={item.link} 
              onClick={() => setIsMobileMenuOpen(false)} 
              className={`flex items-center px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100 shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-blue-600 font-medium'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 2.5 : 2} d={item.icon} /></svg>
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ปุ่มออกจากระบบ */}
      <div className="p-4 border-t border-gray-100 flex-shrink-0">
        <button 
          onClick={() => { setIsMobileMenuOpen(false); setShowLogoutModal(true); }} 
          className="flex items-center w-full px-4 py-3 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors font-bold text-sm"
        >
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          ออกจากระบบ
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ---------------- Modal ยืนยันการออกจากระบบ ---------------- */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm mx-4 transform transition-all border border-gray-100">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-50 mb-5">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">ยืนยันการออกจากระบบ</h3>
              <p className="text-sm text-gray-500 mb-6">คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ?</p>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors">ยกเลิก</button>
              <button onClick={handleLogout} className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-sm">ยืนยัน</button>
            </div>
          </div>
        </div>
      )}

      {/* 💻 Desktop Sidebar (ซ่อนในมือถือ) */}
      <aside className="w-64 bg-white border-r border-gray-100 shadow-sm flex flex-col z-10 hidden md:flex h-full">
        {renderSidebarContent()}
      </aside>

      {/* 📱 Mobile Navbar & Hamburger Menu (แสดงเฉพาะมือถือ) */}
      <header className="h-16 bg-blue-600 shadow-md flex items-center justify-between px-4 sm:px-6 md:hidden z-20 absolute top-0 w-full text-white">
        <div className="font-black text-lg tracking-widest uppercase">Activity Sys</div>
        
        {/* ปุ่มแฮมเบอร์เกอร์ */}
        <div className="flex items-center">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -mr-2 text-blue-100 hover:text-white focus:outline-none"
          >
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* 📱 Mobile Sidebar Overlay (สไลด์ออกมาเมื่อกด Hamburger) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end md:hidden">
          
          {/* ฉากหลังสีดำโปร่งแสง (คลิกพื้นที่ว่างเพื่อปิด) */}
          <div 
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          {/* เมนูที่สไลด์ออกมาจากขวา */}
          <div className="relative flex flex-col max-w-[260px] w-full bg-white shadow-2xl h-full animate-fade-in">
            {/* ปุ่มปิด (X) */}
            <div className="absolute top-0 left-0 -ml-12 pt-3">
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="mr-1 flex items-center justify-center h-10 w-10 rounded-full bg-gray-800/50 backdrop-blur-md text-white focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            {renderSidebarContent()}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;