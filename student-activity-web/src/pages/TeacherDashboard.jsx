import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import TeacherSidebar from "../components/TeacherSidebar";

const TeacherDashboard = () => {
  const [user, setUser] = useState(null);

  // 🆕 State สำหรับเก็บข้อมูลสถิติ
  const [stats, setStats] = useState({ studentCount: 0, pendingCount: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

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
      if (parsedUser.role !== "teacher") {
        if (parsedUser.role === "student") navigate("/studentdashboard");
        else navigate("/");
        return;
      }
      setUser(parsedUser);

      // 🆕 เรียกฟังก์ชันดึงสถิติเมื่อหน้าเว็บโหลดเสร็จ
      fetchDashboardStats(token);
    } catch (error) {
      console.error("Error parsing user data:", error);
      navigate("/");
    }
  }, [navigate]);

  // 🆕 ฟังก์ชันดึงข้อมูลสถิติจาก Laravel
  const fetchDashboardStats = async (token) => {
    try {
      const response = await fetch(
        "http://192.168.43.186:8000/api/teacher/dashboard-stats",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setStats({
          studentCount: data.student_count,
          pendingCount: data.pending_activities_count,
        });
      }
    } catch (error) {
      console.error("ดึงข้อมูลสถิติล้มเหลว:", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  if (!user)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50 text-gray-500 font-medium">
        กำลังโหลดข้อมูลอาจารย์...
      </div>
    );

  return (
    <div className="fixed inset-0 flex bg-gray-50 font-sans overflow-hidden">
      <TeacherSidebar user={user} />

      <main className="flex-1 flex flex-col h-full overflow-hidden pt-16 md:pt-0">
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-5xl mx-auto space-y-6 pb-10">
            {/* Header ทักทาย */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-20 -mt-20 opacity-60 pointer-events-none"></div>

              <div className="relative z-10">
                <h1 className="text-3xl font-extrabold text-gray-900">
                  สวัสดี,{" "}
                  <span className="text-blue-600">
                    อ.{user.profile?.first_name}!
                  </span>{" "}
                  👋
                </h1>
                <p className="text-gray-500 mt-2 text-lg">
                  ยินดีต้อนรับเข้าสู่ระบบจัดการกิจกรรมสำหรับอาจารย์
                </p>
              </div>

              <div className="relative z-10 w-full md:w-auto">
                <Link
                  to="/teacher/scan"
                  className="flex items-center justify-center w-full md:w-auto px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <svg
                    className="w-6 h-6 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                    />
                  </svg>
                  สแกน QR ยืนยันกิจกรรม
                </Link>
              </div>
            </div>

            {/* ข้อมูลสรุปย่อๆ (Stats) ดึงจาก API จริงแล้ว */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {/* การ์ด: นักศึกษาในที่ปรึกษา */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mr-4">
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
                <div>
                  <p className="text-gray-500 font-medium text-sm">
                    นักศึกษาในที่ปรึกษา
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoadingStats ? (
                      <span className="animate-pulse bg-gray-200 text-transparent rounded">
                        00
                      </span>
                    ) : (
                      stats.studentCount
                    )}{" "}
                    <span className="text-sm font-normal text-gray-500">
                      คน
                    </span>
                  </p>
                </div>
                <Link
                  to="/teacher/students"
                  className="ml-auto text-sm font-semibold text-blue-600 hover:text-blue-800 relative z-10"
                >
                  ดูทั้งหมด &rarr;
                </Link>
              </div>

              {/* การ์ด: กิจกรรมรอการอนุมัติ */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-yellow-400 w-2 h-full"></div>
                <div className="w-14 h-14 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center mr-4">
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
                <div>
                  <p className="text-gray-500 font-medium text-sm">
                    กิจกรรมรอการอนุมัติ
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoadingStats ? (
                      <span className="animate-pulse bg-gray-200 text-transparent rounded">
                        00
                      </span>
                    ) : (
                      stats.pendingCount
                    )}{" "}
                    <span className="text-sm font-normal text-gray-500">
                      รายการ
                    </span>
                  </p>
                </div>
                <Link
                  to="/teacher/approvals"
                  className="ml-auto text-sm font-semibold text-blue-600 hover:text-blue-800"
                >
                  ดูทั้งหมด &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
