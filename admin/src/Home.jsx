import React, { useState, useEffect } from 'react';
import AddBookForm from './AddBookForm';
import BookloansManager from './BookloansManager'; // Thêm impor
import AuthorManager from './AuthorManager';
import HandleSeries from './HandleSeries';
import HandlePublishers from './Publishers';
import HandleDashbroad from './Dashbroad';

function CategoryList() {
  const [categories, setCategories] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch('http://localhost/Library/Connection/actions/actionForCategories.php?action=getCategory');
        if (!response.ok) {
          throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          setCategories(data.data);
        } else {
          throw new Error(data.message || 'Không thể lấy danh sách thể loại');
        }
      } catch (error) {
        setError(error.message);
        console.error('Lỗi khi lấy danh sách thể loại:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy 1 lần

  if (loading) return <p>Đang tải danh sách thể loại...</p>;
  if (error) return <p style={{ color: 'red' }}>Lỗi: {error}</p>;

  return (
    <>
    </>
    // <section className="container-list-admin">
    //   <h2>Danh sách Thể loại</h2>
    //   <table>
    //     <thead>
    //       <tr>
    //         <th>ID</th>
    //         <th>Tên thể loại</th>
    //         <th>Mô tả</th>
    //       </tr>
    //     </thead>
    //     <tbody>
    //       {categories.map((category) => (
    //         <tr key={category.CategoryID}>
    //           <td>{category.CategoryID}</td>
    //           <td>{category.CategoryName}</td>
    //           <td>{category.Description}</td>
    //         </tr>
    //       ))}
    //     </tbody>
    //   </table>
    // </section>
  );
}

function PublishersList() {
  const [publishers, setPublishers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 

  useEffect(() => {
    const fetchPublishers = async () => {
      
      try {
        const rp = await fetch('http://localhost/Library/Connection/actions/actionForPublishers.php?action=GetPublishers');

        if (!rp.ok) { throw new Error(`Lỗi HTTP! Trạng thái: ${rp.status}`); }
        const data = await rp.json();

        if (data.success) {
          setPublishers(data.data);
        } else {
          throw new Error(data.message || 'Không thể lấy danh sách nhà xuất bản');
        }
      } catch (error) {
        setError(error.message);
        console.error('Lỗi khi lấy danh sách nhà xuất bản:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublishers();
  }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy 1 lần

  if (loading) return <p>Đang tải danh sách nhà xuất bản...</p>;
  if (error) return <p style={{ color: 'red' }}>Lỗi: {error}</p>;

  return (
    <>
    </>
    // <section className="container-list-admin">
    //   <h2>Danh sách Nhà xuất bản</h2>
    //   <table>
    //     <thead>
    //       <tr>
    //         <th>ID</th>
    //         <th>Tên nhà xuất bản</th>
    //         <th>Địa chỉ</th>
    //       </tr>
    //     </thead>
    //     <tbody>
    //       {publishers.map((publisher) => (
    //         <tr key={publisher.PublisherID}>
    //           <td>{publisher.PublisherID}</td>
    //           <td>{publisher.PublisherName}</td>
    //           <td>{publisher.Address}</td>
    //         </tr>
    //       ))}
    //     </tbody>
    //   </table>
    // </section>
  );
}
const Home = () => {
  const[showAddSeriesForm, setShowAddSeriesBookForm] = useState(false); 
  const [showAddBookForm, setShowAddBookForm] = useState(false);
  const [showAddBookLoans, setShowAddBookLoansForm] = useState(false);
  const [showAddAuthor, setShowAddAuthorForm] = useState(false);
  const [showPublisher, setShowPublisherForm] = useState(false);
  const [showDashbroad, setShowDashbroad] = useState(false)


  // Hàm để hiển thị một form và ẩn các form khác
  const showForm = (setter) => {
    setShowAddSeriesBookForm(false);
    setShowAddBookForm(false);
    setShowAddBookLoansForm(false);
    setShowAddAuthorForm(false);
    setShowPublisherForm(false);
    setShowDashbroad(false);
    // Bất kỳ form nào khác cũng nên được đặt thành false ở đây

    setter(true); // Hiển thị form được yêu cầu
  };

  const hideAllForms = () => {
    setShowAddSeriesBookForm(false);
    setShowAddBookForm(false);
    setShowAddBookLoansForm(false);
    setShowAddAuthorForm(false);
    setShowPublisherForm(false);
    setShowDashbroad(false);

  };

  return (
  <>
  
      <header className="home-header-container">
       <button className="btn" onClick={() => showForm(setShowDashbroad)}>Dashbroad</button>
        <button className='btn' onClick={() => showForm(setShowAddSeriesBookForm)}>Thêm bộ sách</button>
        <button className="btn" onClick={() => showForm(setShowAddBookForm)}>Thêm Sách</button>
        <button className="btn" onClick={() => showForm(setShowAddBookLoansForm)}>Quản lý Mượn Sách</button>
        <button className="btn" onClick={() => showForm(setShowAddAuthorForm)}>Thêm tác giả</button>
        <button className="btn" onClick={() => showForm(setShowPublisherForm)}>Thêm nxb</button>
      </header>

      {showAddBookForm ? (
        <AddBookForm onBookAdded={hideAllForms} onCancel={hideAllForms} />
      ) : showAddBookLoans ? (
        <BookloansManager onCancel={hideAllForms} />
      ) : showAddSeriesForm ? (
        <HandleSeries onSeriesAdded={hideAllForms} onCancel={hideAllForms} />
      ) : showAddAuthor ? (
        <AuthorManager onCancel={hideAllForms} />
      ) : showPublisher ?  (
        <HandlePublishers onCancel={hideAllForms} /> 
      ) : <HandleDashbroad />} 
    </>
  );
};

export default Home;