import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";

const AdminUsers = () => {
  const [user, setUser] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [roleModal, setRoleModal] = useState({
    show: false,
    userId: null,
    userName: "",
    currentRole: "",
  });

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
      if (parsedUser.role !== "admin") return navigate("/");
      setUser(parsedUser);
      fetchUsers(token);
    } catch (error) {
      navigate("/");
    }
  }, [navigate]);

  const fetchUsers = async (token) => {
    try {
      const response = await fetch("http://localhost:8000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setUsersList(await response.json());
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRole = async (newRole) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://localhost:8000/api/admin/users/${roleModal.userId}/role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: newRole }),
        },
      );
      if (response.ok) {
        setUsersList((prev) =>
          prev.map((u) =>
            u.id === roleModal.userId ? { ...u, role: newRole } : u,
          ),
        );
        setRoleModal({
          show: false,
          userId: null,
          userName: "",
          currentRole: "",
        });
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาด");
    }
  };

  // 🆕 ฟังก์ชันยืนยันผู้ใช้งาน
  const handleVerifyUser = async (id, name) => {
    if (!window.confirm(`ยืนยันการอนุมัติบัญชีของ "${name}" ใช่หรือไม่?`))
      return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://localhost:8000/api/admin/users/${id}/verify`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        // อัปเดตข้อมูลบนหน้าจอให้เป็นสีเขียวทันทีโดยไม่ต้องโหลดหน้าใหม่
        setUsersList((prev) =>
          prev.map((u) => (u.id === id ? { ...u, is_verified: true } : u)),
        );
      } else {
        alert("เกิดข้อผิดพลาดในการยืนยันตัวตน");
      }
    } catch (error) {
      alert("เชื่อมต่อเซิร์ฟเวอร์ล้มเหลว");
    }
  };

  // ฟังก์ชันลบผู้ใช้งาน
  const handleDeleteUser = async (id, name) => {
    if (
      !window.confirm(
        `⚠️ คำเตือน: คุณแน่ใจหรือไม่ว่าต้องการลบ "${name}" ออกจากระบบ? ข้อมูลกิจกรรมจะหายไปอย่างถาวร!`,
      )
    )
      return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://localhost:8000/api/admin/users/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        setUsersList((prev) => prev.filter((u) => u.id !== id));
      } else {
        alert("เกิดข้อผิดพลาดในการลบผู้ใช้งาน");
      }
    } catch (error) {
      alert("เชื่อมต่อเซิร์ฟเวอร์ล้มเหลว");
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const matchesTab = activeTab === "all" || u.role === activeTab;
    const matchesSearch =
      (u.first_name + " " + u.last_name)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      u.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  if (!user)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
        กำลังโหลด...
      </div>
    );

  return (
    <div className="fixed inset-0 flex bg-gray-50 font-sans overflow-hidden">
      <AdminSidebar user={user} />

      <main className="flex-1 flex flex-col h-full overflow-hidden pt-16 md:pt-0">
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-6xl mx-auto space-y-6 pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-6">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900">
                  จัดการผู้ใช้งาน 👥
                </h1>
                <p className="text-gray-500 mt-2">
                  ดูรายชื่อ ค้นหา อนุมัติ และจัดการบัญชีในระบบ
                </p>
              </div>
              <div className="bg-fuchsia-50 text-fuchsia-700 px-4 py-2 rounded-xl font-bold border border-fuchsia-200 shadow-sm">
                ผู้ใช้ทั้งหมด: {usersList.length} บัญชี
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === "all" ? "bg-white text-fuchsia-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  ทั้งหมด
                </button>
                <button
                  onClick={() => setActiveTab("student")}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === "student" ? "bg-white text-fuchsia-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  นักศึกษา
                </button>
                <button
                  onClick={() => setActiveTab("teacher")}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === "teacher" ? "bg-white text-fuchsia-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  อาจารย์
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ, รหัส, อีเมล..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-gray-100 text-sm text-gray-500 font-semibold uppercase tracking-wider">
                      <th className="px-6 py-4">โปรไฟล์ผู้ใช้งาน</th>
                      <th className="px-6 py-4">ประเภทบัญชี</th>
                      <th className="px-6 py-4">แผนก</th>
                      <th className="px-6 py-4">สถานะ</th>
                      <th className="px-6 py-4 text-right">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {isLoading ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-10 text-center text-gray-500 font-medium"
                        >
                          กำลังโหลดข้อมูล...
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-10 text-center text-gray-500 font-medium"
                        >
                          ไม่พบข้อมูลผู้ใช้งานที่ค้นหา
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr
                          key={u.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white mr-3 ${u.role === "teacher" ? "bg-fuchsia-500" : "bg-blue-500"}`}
                              >
                                {u.first_name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">
                                  {u.first_name} {u.last_name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {u.role === "student"
                                    ? `รหัส: ${u.student_id}`
                                    : "อาจารย์ที่ปรึกษา"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() =>
                                setRoleModal({
                                  show: true,
                                  userId: u.id,
                                  userName: u.first_name,
                                  currentRole: u.role,
                                })
                              }
                              className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border transition-all hover:scale-105 ${
                                u.role === "admin"
                                  ? "bg-purple-100 text-purple-700 border-purple-200"
                                  : u.role === "teacher"
                                    ? "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200"
                                    : "bg-blue-100 text-blue-700 border-blue-200"
                              }`}
                            >
                              {u.role} ⚙️
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-900 font-medium">
                              {u.email}
                            </p>
                            <p className="text-xs text-gray-500">
                              {u.department}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            {u.is_verified ? (
                              <span className="flex items-center text-xs font-bold text-green-600">
                                <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>
                                ยืนยันแล้ว
                              </span>
                            ) : (
                              <span className="flex items-center text-xs font-bold text-yellow-600">
                                <span className="w-2 h-2 rounded-full bg-yellow-500 mr-1.5"></span>
                                รอยืนยันตัวตน
                              </span>
                            )}
                          </td>

                          {/* 🆕 คอลัมน์ปุ่มจัดการ */}
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              {/* ปุ่มยืนยัน (โชว์เฉพาะคนที่ยังไม่ยืนยัน) */}
                              {!u.is_verified && (
                                <button
                                  onClick={() =>
                                    handleVerifyUser(
                                      u.id,
                                      `${u.first_name} ${u.last_name}`,
                                    )
                                  }
                                  className="text-green-600 hover:text-white hover:bg-green-600 p-2 rounded-lg transition-colors border border-transparent hover:border-green-600 bg-green-50"
                                  title="อนุมัติผู้ใช้งาน"
                                >
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2.5}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                </button>
                              )}

                              {/* ปุ่มลบ */}
                              <button
                                onClick={() =>
                                  handleDeleteUser(
                                    u.id,
                                    `${u.first_name} ${u.last_name}`,
                                  )
                                }
                                className="text-red-500 hover:text-white hover:bg-red-500 p-2 rounded-lg transition-colors border border-transparent hover:border-red-600 bg-red-50"
                                title="ลบผู้ใช้งาน"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* ---------------- Modal เปลี่ยนสิทธิ์ (Role) ---------------- */}
      {roleModal.show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xs overflow-hidden animate-fade-in">
            <div className="p-6 text-center">
              <h3 className="font-bold text-gray-900 mb-1">เปลี่ยนสิทธิ์ของ {roleModal.userName}</h3>
              <p className="text-xs text-gray-500 mb-6">ปัจจุบันเป็น: <span className="font-bold uppercase text-fuchsia-600">{roleModal.currentRole}</span></p>
              
              <div className="space-y-3">
                {['student', 'teacher', 'admin'].map(r => (
                  <button 
                    key={r}
                    onClick={() => handleUpdateRole(r)}
                    disabled={roleModal.currentRole === r}
                    className={`w-full py-3 rounded-xl font-bold uppercase text-xs transition-all ${
                      roleModal.currentRole === r ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-fuchsia-50 text-fuchsia-700 hover:bg-fuchsia-600 hover:text-white'
                    }`}
                  >
                    ให้สิทธิ์เป็น {r}
                  </button>
                ))}
              </div>
              <button onClick={() => setRoleModal({ show: false })} className="mt-6 text-gray-400 text-xs font-bold hover:text-gray-600">ยกเลิก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
