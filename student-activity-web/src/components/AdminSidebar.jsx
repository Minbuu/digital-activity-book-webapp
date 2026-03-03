import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const AdminSidebar = ({ user }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('http://localhost:8000/api/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'ภาพรวมระบบ', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', link: '/admindashboard' },
    { id: 'users', label: 'จัดการผู้ใช้งาน', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', link: '/admin/users' },
    { id: 'departments', label: 'จัดการแผนกวิชา', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', link: '/admin/departments' },
    { id: 'activities', label: 'จัดการกิจกรรมส่วนกลาง', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', link: '/admin/activities' },
];

  const renderSidebarContent = () => (
    <>
      <div className="h-16 md:h-20 flex items-center px-6 md:px-8 border-b border-fuchsia-900/50 flex-shrink-0 bg-fuchsia-950">
        <svg className="w-8 h-8 mr-3 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
        <span className="font-bold text-lg tracking-wide text-white">Admin Control</span>
      </div>

      <div className="p-6 border-b border-fuchsia-900/50 flex flex-col items-center text-center flex-shrink-0">
        <div className="w-16 h-16 bg-fuchsia-500 text-white rounded-full flex items-center justify-center text-xl font-bold mb-3 shadow-inner">
          A
        </div>
        <p className="font-semibold text-slate-100">ผู้ดูแลระบบ</p>
        <p className="text-xs text-fuchsia-300 mt-1">Super Admin</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.link;
          return (
            <Link key={item.id} to={item.link} onClick={() => setIsMobileMenuOpen(false)} 
              className={`flex items-center px-4 py-3 rounded-xl transition-colors ${
                isActive ? 'bg-fuchsia-600 text-white font-semibold shadow-md' : 'text-fuchsia-200 hover:bg-fuchsia-800 hover:text-white font-medium'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-fuchsia-900/50 flex-shrink-0">
        <button onClick={() => { setIsMobileMenuOpen(false); setShowLogoutModal(true); }} className="flex items-center w-full px-4 py-3 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-colors font-medium text-sm">
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          ออกจากระบบ
        </button>
      </div>
    </>
  );

  return (
    <>
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">ยืนยันการออกจากระบบ</h3>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-800 font-semibold rounded-xl">ยกเลิก</button>
              <button onClick={handleLogout} className="flex-1 py-2.5 bg-red-600 text-white font-semibold rounded-xl">ยืนยัน</button>
            </div>
          </div>
        </div>
      )}

      <aside className="w-64 bg-slate-950 border-r border-fuchsia-900/30 flex flex-col z-10 hidden md:flex h-full text-white">
        {renderSidebarContent()}
      </aside>

      <header className="h-16 bg-slate-950 flex items-center justify-between px-4 md:hidden z-20 absolute top-0 w-full text-white border-b border-fuchsia-900/50">
        <div className="font-bold text-fuchsia-400 text-lg">Admin Control</div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-fuchsia-300">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end md:hidden">
          <div className="fixed inset-0 bg-black/70" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative flex flex-col max-w-[260px] w-full bg-slate-950 h-full">
            <div className="absolute top-0 left-0 -ml-12 pt-3">
              <button onClick={() => setIsMobileMenuOpen(false)} className="h-10 w-10 rounded-full bg-slate-800 text-white flex items-center justify-center"><svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            {renderSidebarContent()}
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;