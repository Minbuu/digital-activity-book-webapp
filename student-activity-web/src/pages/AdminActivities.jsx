import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";

const AdminActivities = () => {
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [categories, setCategories] = useState([]); // เก็บรายชื่อหมวดหมู่
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    hours: "",
    category_id: "",
    description: "",
  });

  const navigate = useNavigate();

  // 1. ตรวจสอบสิทธิ์และเริ่มดึงข้อมูล
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!token || !storedUser) return navigate("/");
    
    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== "admin") return navigate("/");
      setUser(parsedUser);
      fetchInitialData(token);
    } catch (error) {
      navigate("/");
    }
  }, [navigate]);

  // 2. ฟังก์ชันดึงข้อมูล (รวมเป็นหนึ่งเดียวเพื่อประสิทธิภาพ)
  const fetchInitialData = async (token) => {
    setIsLoading(true);
    try {
      const [resAct, resCat] = await Promise.all([
        fetch("http://localhost:8000/api/admin/activities", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:8000/api/admin/categories", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (resAct.ok) setActivities(await resAct.json());
      if (resCat.ok) setCategories(await resCat.json());
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. จัดการการเปิด Modal
  const handleOpenAdd = () => {
    setIsEditMode(false);
    setFormData({ title: "", hours: "", category_id: "", description: "" });
    setShowModal(true);
  };

  const handleOpenEdit = (act) => {
    setIsEditMode(true);
    setCurrentId(act.id);
    setFormData({
      title: act.title,
      hours: act.hours,
      category_id: act.category_id || "",
      description: act.description || "",
    });
    setShowModal(true);
  };

  // 4. บันทึกข้อมูล (POST / PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const url = isEditMode
      ? `http://localhost:8000/api/admin/activities/${currentId}`
      : "http://localhost:8000/api/admin/activities";

    try {
      const response = await fetch(url, {
        method: isEditMode ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowModal(false);
        fetchInitialData(token); // โหลดข้อมูลใหม่หลังจากบันทึก
      } else {
        alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (error) {
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    }
  };

  // 5. ลบกิจกรรม
  const handleDelete = async (id) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบกิจกรรมนี้?")) return;
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:8000/api/admin/activities/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setActivities((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (error) {
      alert("ลบข้อมูลไม่สำเร็จ");
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 flex bg-gray-50 font-sans overflow-hidden">
      <AdminSidebar user={user} />
      <main className="flex-1 flex flex-col h-full overflow-hidden pt-16 md:pt-0">
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-6xl mx-auto space-y-6 pb-10">
            
            <div className="flex justify-between items-center border-b pb-6">
              <h1 className="text-3xl font-extrabold text-gray-900">จัดการกิจกรรมส่วนกลาง 📋</h1>
              <button
                onClick={handleOpenAdd}
                className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm transition-all"
              >
                + เพิ่มกิจกรรมใหม่
              </button>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-600"></div>
                <p className="mt-4 text-gray-500 font-bold">กำลังโหลดข้อมูล...</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed text-gray-400 font-bold">
                ยังไม่มีข้อมูลกิจกรรมในระบบ
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                {activities.map((act) => (
                  <div key={act.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-fuchsia-50 text-fuchsia-600 px-3 py-1 rounded-lg text-xs font-bold border border-fuchsia-100">
                        {act.hours} ชั่วโมง
                      </span>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenEdit(act)} className="text-gray-400 hover:text-blue-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                        <button onClick={() => handleDelete(act.id)} className="text-gray-400 hover:text-red-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{act.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-4">{act.description || "ไม่มีคำอธิบาย"}</p>
                    <div className="mt-auto pt-4 border-t flex items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      <span className="bg-gray-100 px-2 py-0.5 rounded mr-1">หมวดหมู่:</span> {act.category?.name || "ทั่วไป"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal จัดการกิจกรรม */}
      {showModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-scale-up">
            <h2 className="text-xl font-bold mb-6 text-gray-900">
              <span className="w-2 h-8 bg-fuchsia-600 rounded-full mr-3 inline-block align-middle"></span>
              {isEditMode ? "แก้ไขข้อมูลกิจกรรม" : "รายละเอียดกิจกรรมใหม่"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">ชื่อกิจกรรม</label>
                <input required placeholder="ชื่อกิจกรรม" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full border rounded-xl px-4 py-3 bg-gray-50 focus:border-fuchsia-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">จำนวนชั่วโมง</label>
                <input required type="number" placeholder="ชั่วโมง" value={formData.hours} onChange={(e) => setFormData({ ...formData, hours: e.target.value })} className="w-full border rounded-xl px-4 py-3 bg-gray-50 focus:border-fuchsia-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">หมวดหมู่กิจกรรม</label>
                <select required value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-900 focus:border-fuchsia-500 focus:outline-none">
                  <option value="">-- กรุณาเลือกหมวดหมู่ --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">คำอธิบาย</label>
                <textarea placeholder="รายละเอียดเพิ่มเติม..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full border rounded-xl px-4 py-3 h-28 bg-gray-50 focus:border-fuchsia-500 focus:outline-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors">ยกเลิก</button>
              <button type="submit" className="flex-1 py-3 bg-fuchsia-600 text-white rounded-xl font-bold shadow-md hover:bg-fuchsia-700 transition-colors">
                {isEditMode ? "อัปเดตข้อมูล" : "บันทึกกิจกรรม"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminActivities;