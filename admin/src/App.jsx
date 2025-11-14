import React, { useState } from 'react';
import './css/App.css';
import './css/HandleAdmin.css';
import './css/home.css'
import AdminManager from './HandleAdmin.jsx';
import Home from './Home.jsx';
import StudentManager from './StudentManager.jsx';
import BookloansManager from './BookloansManager.jsx';
import './css/StudentManager.css';
import './css/Dashbroad.css'; 
import './css/HandleSeries.css';
import './css/Book.css';
import './css/BookLoans.css';


// Một object để map tên tab với component tương ứng
const tabComponents = {
  Home: <Home />,
  Student: <StudentManager />,
  Admin: <AdminManager />,
};

function App() {
  // State để quản lý tab đang hoạt động, mặc định là 'Admin'
  const [activeTab, setActiveTab] = useState('Home');
 
  return (
    <>
      <nav className="container"> 
        
        {/*
          Sử dụng `Object.keys` để tự động tạo các nút từ object `tabComponents`.
          Điều này giúp code dễ bảo trì và mở rộng hơn.
        */}
        {Object.keys(tabComponents).map((tab) => (
          <button
            key={tab}
            className={`btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
        <button className="logout">Log Out</button>
      </nav>

      {/* Hiển thị component tương ứng với tab đang hoạt động */}
      {tabComponents[activeTab]}
    </>
  );
}

export default App;
