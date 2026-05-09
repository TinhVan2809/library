import React, { useState } from 'react';
import './styles/App.css';
import './styles/HandleAdmin.css';
import './styles/home.css'
import AdminManager from './pages/HandleAdmin.jsx';
import Home from './pages/Home.jsx';
import StudentManager from './pages/StudentManager.jsx';
import BookloansManager from './pages/BookloansManager.jsx';
import './styles/StudentManager.css';
import './styles/Dashbroad.css'; 
import './styles/HandleSeries.css';
import './styles/Book.css';
import './styles/BookLoans.css';


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
