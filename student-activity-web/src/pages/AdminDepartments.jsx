import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

const AdminDepartments = () => {
  const [user, setUser] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State สำหรับ Modal เพิ่มแผนก
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      if (parsedUser.role !== 'admin') return navigate('/');
      setUser(parsedUser);
      fetchDepartments(token);
    } catch (error) { navigate('/'); }
  }, [navigate]);

  const fetchDepartments = async (token) => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/departments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setDepartments(await response.json());
      }
    } catch (error) { console.error(error); } 
    finally { setIsLoading(false); }
  };

  // 🆕 ฟังก์ชันกดบันทึกแผนกใหม่
  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    
    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:8000/api/admin/departments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ name: newDeptName })
      });

      if (response.ok) {
        const data = await response.json();
        // เอาแผนกใหม่ยัดใส่ตารางทันที
        setDepartments(prev => [...prev, data.department].sort((a, b) => a.name.localeCompare(b.name)));
        setShowAddModal(false);
        setNewDeptName('');
      } else {
        alert('เกิดข้อผิดพลาด หรือมีชื่อแผนกวิชานี้อยู่ในระบบแล้ว');
      }
    } catch (error) { alert('เชื่อมต่อเซิร์ฟเวอร์ล้มเหลว'); }
    finally { setIsSubmitting(false); }
  };

  // 🆕 ฟังก์ชันลบแผนกวิชา
  const handleDelete = async (id, name) => {
    if (!window.confirm(`⚠️ คำเตือน: คุณแน่ใจหรือไม่ว่าต้องการลบแผนก "${name}" ?`)) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8000/api/admin/departments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setDepartments(prev => prev.filter(d => d.id !== id));
      } else {
        alert('เกิดข้อผิดพลาดในการลบแผนกวิชา');
      }
    } catch (error) { alert('เชื่อมต่อเซิร์ฟเวอร์ล้มเหลว'); }
  };

  if (!user) return <div className="fixed inset-0 flex items-center justify-center bg-gray-50">กำลังโหลด...</div>;

  return (
    <div className="fixed inset-0 flex bg-gray-50 font-sans overflow-hidden">
      <AdminSidebar user={user} />

      <main className="flex-1 flex flex-col h-full overflow-hidden pt-16 md:pt-0">
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-4xl mx-auto space-y-6 pb-10">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900">จัดการแผนกวิชา 🏫</h1>
                <p className="text-gray-500 mt-2">เพิ่ม/ลบ แผนกวิชาและสาขาต่างๆ ในวิทยาลัย</p>
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm flex items-center w-full md:w-auto justify-center"
              >
                +
                เพิ่มแผนกใหม่
              </button>
            </div>

            {/* ตารางแสดงแผนก */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-6">
              <div className="bg-slate-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">รายชื่อแผนกวิชาทั้งหมด</h3>
                <span className="bg-fuchsia-100 text-fuchsia-700 text-xs font-bold px-3 py-1 rounded-lg">{departments.length} แผนก</span>
              </div>
              
              {isLoading ? (
                <div className="p-10 text-center text-gray-500 font-medium">กำลังโหลดข้อมูล...</div>
              ) : departments.length === 0 ? (
                <div className="p-10 text-center text-gray-500">ยังไม่มีข้อมูลแผนกวิชาในระบบ</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {departments.map((dept, index) => (
                    <div key={dept.id} className="p-5 px-6 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center font-bold text-sm border border-fuchsia-100">
                          {index + 1}
                        </div>
                        <span className="font-bold text-gray-900 text-lg">{dept.name}</span>
                      </div>
                      
                      <button 
                        onClick={() => handleDelete(dept.id, dept.name)}
                        className="text-gray-400 hover:text-white hover:bg-red-500 p-2.5 rounded-xl transition-all border border-transparent hover:border-red-600 opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="ลบแผนก"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* ---------------- Modal เพิ่มแผนก ---------------- */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-fuchsia-600 p-5 text-white flex justify-between items-center">
              <h2 className="text-lg font-bold">เพิ่มแผนกวิชาใหม่</h2>
              <button onClick={() => setShowAddModal(false)} className="text-fuchsia-200 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleAddDepartment} className="p-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">ชื่อแผนกวิชา / สาขา</label>
              <input 
                autoFocus
                required 
                type="text" 
                value={newDeptName} 
                onChange={(e) => setNewDeptName(e.target.value)} 
                placeholder="เช่น เทคโนโลยีธุรกิจดิจิทัล" 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 mb-6" 
              />
              
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors">
                  ยกเลิก
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-3 bg-fuchsia-600 hover:bg-fuchsia-700 disabled:bg-fuchsia-400 text-white font-bold rounded-xl transition-colors shadow-sm">
                  {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default AdminDepartments;