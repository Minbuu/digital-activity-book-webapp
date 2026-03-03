import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    total_students: 0,
    total_teachers: 0,
    total_activities: 0,
    pending_activities: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token || !storedUser) {
      navigate("/");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      // เช็คสิทธิ์ ต้องเป็น admin เท่านั้น
      if (parsedUser.role !== "admin") {
        navigate("/");
        return;
      }
      setUser(parsedUser);
      fetchAdminStats(token);
    } catch (error) {
      navigate("/");
    }
  }, [navigate]);

  const fetchAdminStats = async (token) => {
    try {
      const response = await fetch(
        "http://192.168.43.186:8000/api/admin/dashboard-stats",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        setStats(await response.json());
      }
    } catch (error) {
      console.error("ดึงข้อมูลสถิติผิดพลาด:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleExport = async () => {
    const token = localStorage.getItem("token");
    try {
      // ใช้ window.open หรือสร้างลิงก์ชั่วคราวเพื่อดาวน์โหลดไฟล์
      const response = await fetch(
        "http://localhost:8000/api/admin/export-report",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `report_activities_${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        alert("ไม่สามารถสร้างรายงานได้");
      }
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  if (!user)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
        กำลังโหลด...
      </div>
    );

  return (
    <div className="fixed inset-0 flex bg-gray-50 font-sans overflow-hidden">
      <AdminSidebar user={user} />

      <main className="flex-1 flex flex-col h-full overflow-y-auto pt-16 md:pt-0">
        <div className="flex-1 p-6 md:p-10">
          <div className="max-w-6xl mx-auto space-y-6 pb-10">
            {/* Header */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900">
                  ภาพรวมระบบ (Admin) ⚙️
                </h1>
                <p className="text-gray-500 mt-2">
                  ยินดีต้อนรับเข้าสู่ระบบจัดการข้อมูลส่วนกลาง
                </p>
                <button
                  onClick={handleExport}
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm flex items-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  ส่งออก Excel (.xlsx)
                </button>
              </div>
            </div>

            {/* สถิติ 4 การ์ด */}
            {isLoading ? (
              <div className="py-20 text-center text-gray-500">
                กำลังโหลดสถิติภาพรวม...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* นักศึกษา */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-100 flex flex-col justify-center items-center text-center">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-3xl font-black text-gray-900">
                    {stats.total_students}
                  </p>
                  <p className="text-gray-500 font-medium text-sm mt-1">
                    นักศึกษาทั้งหมด
                  </p>
                </div>

                {/* อาจารย์ */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-fuchsia-100 flex flex-col justify-center items-center text-center">
                  <div className="w-14 h-14 bg-fuchsia-50 text-fuchsia-600 rounded-2xl flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-3xl font-black text-gray-900">
                    {stats.total_teachers}
                  </p>
                  <p className="text-gray-500 font-medium text-sm mt-1">
                    อาจารย์ทั้งหมด
                  </p>
                </div>

                {/* กิจกรรมทั้งหมด */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-green-100 flex flex-col justify-center items-center text-center">
                  <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                      />
                    </svg>
                  </div>
                  <p className="text-3xl font-black text-gray-900">
                    {stats.total_activities}
                  </p>
                  <p className="text-gray-500 font-medium text-sm mt-1">
                    กิจกรรมที่บันทึกในระบบ
                  </p>
                </div>

                {/* กิจกรรมค้างตรวจ */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-yellow-100 flex flex-col justify-center items-center text-center">
                  <div className="w-14 h-14 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-3xl font-black text-gray-900">
                    {stats.pending_activities}
                  </p>
                  <p className="text-gray-500 font-medium text-sm mt-1">
                    กิจกรรมรออาจารย์อนุมัติ
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
