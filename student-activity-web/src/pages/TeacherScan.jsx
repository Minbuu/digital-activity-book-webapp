import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Scanner } from '@yudiel/react-qr-scanner';

const TeacherScan = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(''); // เก็บ Token ของอาจารย์เพื่อยิง API
  
  // State สำหรับจัดการการสแกน
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanStatus, setScanStatus] = useState(null); // 'success', 'error', null
  const [statusMessage, setStatusMessage] = useState('');
  
  // เผื่อใช้ทดสอบบน PC ที่ไม่มีกล้อง (พิมพ์ Token ด้วยมือ)
  const [manualToken, setManualToken] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (!storedToken || !storedUser) {
      navigate('/');
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      // เช็คสิทธิ์ ต้องเป็นอาจารย์เท่านั้น
      if (parsedUser.role !== 'teacher') {
        navigate('/');
        return;
      }
      setUser(parsedUser);
      setToken(storedToken);
    } catch (error) {
      navigate('/');
    }
  }, [navigate]);

  // ฟังก์ชันยิง API ไปยืนยัน Token
  const verifyQRCode = async (qrToken) => {
    if (isProcessing) return; // ป้องกันการสแกนรัวๆ
    
    setIsProcessing(true);
    setScanStatus(null);
    setStatusMessage('กำลังตรวจสอบข้อมูล...');

    try {
      const response = await fetch('http://192.168.43.186:8000/api/activities/scan-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ token: qrToken })
      });

      const result = await response.json();

      if (response.ok) {
        setScanStatus('success');
        setStatusMessage(result.message || 'ยืนยันกิจกรรมสำเร็จ!');
        // เล่นเสียงแจ้งเตือนสั้นๆ (ถ้าเบราว์เซอร์อนุญาต)
        try { new Audio('https://www.soundjay.com/buttons/sounds/button-09.mp3').play(); } catch(e){}
      } else {
        setScanStatus('error');
        setStatusMessage(result.message || 'QR Code ไม่ถูกต้องหรือหมดอายุ');
        try { new Audio('https://www.soundjay.com/buttons/sounds/button-10.mp3').play(); } catch(e){}
      }
    } catch (error) {
      setScanStatus('error');
      setStatusMessage('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      // หน่วงเวลา 3 วินาที แล้วเคลียร์ข้อความ เพื่อให้พร้อมสแกนคนต่อไป
      setTimeout(() => {
        setIsProcessing(false);
        setScanStatus(null);
        setStatusMessage('');
      }, 3000);
    }
  };

  // เมื่อกล้องสแกนเจอ QR
  const handleScan = (detectedCodes) => {
    // detectedCodes จะคืนค่ามาเป็น Array (Library ตัวนี้อ่านได้หลายอันพร้อมกัน)
    if (detectedCodes && detectedCodes.length > 0) {
      const qrValue = detectedCodes[0].rawValue;
      if (qrValue && !isProcessing) {
        verifyQRCode(qrValue);
      }
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualToken.trim()) {
      verifyQRCode(manualToken.trim());
      setManualToken('');
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 font-sans overflow-hidden  flex flex-col">
      
      {/* ---------------- Navbar / Header ---------------- */}
      <header className="h-16 bg-slate-800 shadow-md flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
        <div className="flex items-center">
          <Link to="/teacherdashboard" className="text-slate-300 hover:text-white mr-4 p-2 rounded-full hover:bg-slate-700 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="font-bold text-white text-lg tracking-wide">สแกน QR กิจกรรม</h1>
        </div>
        <div className="text-xs font-medium text-slate-400 bg-slate-700 px-3 py-1.5 rounded-full">
          โหมดอาจารย์
        </div>
      </header>

      {/* ---------------- Main Content ---------------- */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 w-full max-w-md mx-auto">
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">สแกน QR Code</h2>
          <p className="text-slate-400 text-sm">เล็งกล้องไปที่ QR Code ของนักศึกษาเพื่อยืนยันการเข้าร่วมกิจกรรม</p>
        </div>

        {/* ---------------- Scanner Area ---------------- */}
        <div className="w-full bg-slate-800 p-2 rounded-3xl shadow-2xl relative overflow-hidden border-2 border-slate-700">
          
          {/* กรอบกล้องสแกน */}
          <div className="rounded-2xl overflow-hidden aspect-square bg-black relative">
            <Scanner 
              onScan={handleScan}
              onError={(error) => console.log(error?.message)}
              components={{
                audio: false, // ปิดเสียงติ๊ดของ Library (เราเขียนเสียงเตือนเองแล้ว)
                finder: true, // แสดงกรอบสี่เหลี่ยมเล็ง
              }}
              styles={{
                container: { width: '100%', height: '100%' },
              }}
            />
            
            {/* Overlay ตอนกำลังประมวลผล */}
            {isProcessing && (
              <div className="absolute inset-0 bg-slate-900 bg-opacity-80 backdrop-blur-sm flex flex-col items-center justify-center z-10 animate-fade-in">
                <svg className="animate-spin h-12 w-12 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-white font-bold text-lg">กำลังตรวจสอบ...</p>
              </div>
            )}
          </div>

        </div>

        {/* ---------------- Status Message ---------------- */}
        <div className="h-24 w-full mt-6 flex items-center justify-center">
          {scanStatus === 'success' && (
            <div className="bg-green-500 text-white px-6 py-4 rounded-2xl shadow-lg flex items-center animate-fade-in-up w-full">
              <div className="bg-green-600 rounded-full p-1 mr-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="font-bold text-lg">{statusMessage}</span>
            </div>
          )}
          
          {scanStatus === 'error' && (
            <div className="bg-red-500 text-white px-6 py-4 rounded-2xl shadow-lg flex items-center animate-fade-in-up w-full">
              <div className="bg-red-600 rounded-full p-1 mr-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </div>
              <span className="font-bold text-base">{statusMessage}</span>
            </div>
          )}
        </div>

        {/* ---------------- Manual Input (สำหรับทดสอบบนคอม) ----------------
        <div className="w-full mt-auto pt-8">
          <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
            <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">โหมดทดสอบ (กรอก Token ด้วยมือ)</p>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input 
                type="text" 
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="วาง QR Token ที่นี่..." 
                className="flex-1 bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
              <button 
                type="submit" 
                disabled={isProcessing || !manualToken}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
              >
                ยืนยัน
              </button>
            </form>
          </div>
        </div> */}

      </main>
    </div>
  );
};

export default TeacherScan;