import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const Activities = () => {
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ทั้งหมด");

  // State สำหรับจัดการ Modal ฟอร์ม
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    hours: "",
    location: "",
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
      setUser(JSON.parse(storedUser));
      fetchActivities(token);
    } catch (error) {
      navigate("/");
    }
  }, [navigate]);

  // ฟังก์ชันดึงรายการกิจกรรม
  // ฟังก์ชันดึงรายการกิจกรรม
  const fetchActivities = async (token) => {
    try {
      const response = await fetch(
        "http://192.168.43.186:8000/api/student/activities",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        setActivities(await response.json());
      } else {
        const errData = await response.json();
        alert("โหลดข้อมูลกิจกรรมไม่สำเร็จ: " + errData.message); // เด้งบอก Error
      }
    } catch (error) {
      console.error("ดึงข้อมูลผิดพลาด:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // จัดการการเปลี่ยนค่าในฟอร์ม
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ฟังก์ชันกดส่งฟอร์ม (Submit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://192.168.43.186:8000/api/student/activities",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json", // 👈 เพิ่มตัวนี้ เพื่อให้ Laravel ส่ง Error กลับมาเป็น JSON
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        },
      );

      if (response.ok) {
        // ปิดป๊อปอัป ล้างฟอร์ม และดึงข้อมูลใหม่
        setShowAddModal(false);
        setFormData({ title: "", date: "", hours: "", location: "" });
        fetchActivities(token);
        setActiveTab("รออนุมัติ");
      } else {
        // 👈 ให้ดึงข้อความ Error จริงๆ จาก Laravel มาแจ้งเตือน
        const errorData = await response.json();
        console.error("รายละเอียด Error:", errorData);
        alert(`ระบบขัดข้อง: ${errorData.message}`);
      }
    } catch (error) {
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  // กรองข้อมูลตาม Tab ที่เลือก (แก้บั๊ก 0/1 กับ true/false)
  const filteredActivities = activities.filter((act) => {
    if (activeTab === "รออนุมัติ") return !act.is_approved;
    if (activeTab === "เสร็จสิ้น") return !!act.is_approved;
    return true; // ทั้งหมด
  });

  if (!user)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
        กำลังโหลด...
      </div>
    );

  return (
    <div className="fixed inset-0 flex bg-gray-50 font-sans overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-y-auto pt-16 md:pt-0">
        <div className="flex-1 p-6 md:p-10">
          <div className="max-w-6xl mx-auto space-y-6 pb-10">
            {/* ---------------- Header ---------------- */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900">
                  กิจกรรมของฉัน
                </h1>
                <p className="text-gray-500 mt-2">
                  ติดตามสถานะและบันทึกกิจกรรมจิตอาสาของคุณ
                </p>
              </div>

              {/* ปุ่มเปิด Modal เพิ่มกิจกรรม */}
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md flex items-center w-full sm:w-auto justify-center"
              >
                + เพิ่มกิจกรรมจิตอาสา
              </button>
            </div>

            {/* ---------------- Tabs ---------------- */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex bg-gray-100 p-1 rounded-xl">
                {["ทั้งหมด", "รออนุมัติ", "เสร็จสิ้น"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2 rounded-lg font-bold text-sm transition-colors ${
                      activeTab === tab
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* ---------------- รายการกิจกรรม ---------------- */}
            {isLoading ? (
              <div className="py-20 text-center text-gray-500 font-medium">
                กำลังโหลดข้อมูล...
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 text-center mt-6">
                <p className="text-gray-500">ไม่มีกิจกรรมในหมวดหมู่นี้</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {filteredActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col relative overflow-hidden"
                  >
                    {/* Header ของการ์ด */}
                    <div className="flex justify-between items-start mb-4">
                      {activity.is_approved ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                          เสร็จสิ้นแล้ว
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                          รออาจารย์ตรวจสอบ
                        </span>
                      )}
                      <span className="font-bold text-blue-600 text-sm">
                        {activity.hours} ชม.
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-900 text-lg mb-4 line-clamp-2 min-h-[56px]">
                      {activity.title}
                    </h3>

                    <div className="text-sm text-gray-500 space-y-2 mb-6 flex-1">
                      <p className="flex items-center">
                        <span className="mr-2">📍</span> {activity.location}
                      </p>
                      <p className="flex items-center">
                        <span className="mr-2">📅</span>{" "}
                        {new Date(activity.date).toLocaleDateString("th-TH")}
                      </p>
                    </div>

                    {/* ปุ่มสแกน หรือ สถานะการรับรอง */}
                    <div className="mt-auto">
                      {activity.is_approved ? (
                        <div className="bg-green-50 text-green-700 p-3 rounded-xl flex flex-col items-center justify-center border border-green-100">
                          <span className="font-bold text-sm mb-1">
                            ได้รับการรับรองแล้ว
                          </span>
                          <span className="text-xs flex items-center">
                            ✅ {activity.teacher_name}
                          </span>
                        </div>
                      ) : (
                        // ถ้าอยากทำระบบสแกนต่อในอนาคต สามารถเปลี่ยนเป็น Link ได้
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center text-sm shadow-sm">
                          <svg
                            className="w-5 h-5 mr-2"
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
                          สแกนเพื่อยืนยัน
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ---------------- Modal ฟอร์มเพิ่มกิจกรรม ---------------- */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">บันทึกกิจกรรมจิตอาสา</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-blue-200 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  ชื่อกิจกรรม
                </label>
                <input
                  required
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="เช่น กวาดลานวัด, ช่วยงานห้องสมุด"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  สถานที่ทำกิจกรรม
                </label>
                <input
                  required
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="ระบุสถานที่"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    วันที่ทำกิจกรรม
                  </label>
                  <input
                    required
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    จำนวนชั่วโมง
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    name="hours"
                    value={formData.hours}
                    onChange={handleInputChange}
                    placeholder="ชม."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center"
                >
                  {isSubmitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activities;
