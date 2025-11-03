import React, { useState, useEffect } from 'react';

function AddAdminForm() {
  // State để quản lý dữ liệu của form
  const [formData, setFormData] = useState({
    AdminName: '',
    AdminGmail: '',
    AdminPassword: '',
    AdminAge: '',
    AdminGender: 'M', // Giá trị mặc định là Nam
  });

  // State để hiển thị thông báo từ server
  const [message, setMessage] = useState('');

  // Hàm xử lý khi người dùng thay đổi giá trị trong input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Hàm xử lý khi người dùng submit form
  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn chặn hành vi mặc định của form
    setMessage(''); // Xóa thông báo cũ

    // PHP đang dùng `$_POST`, nên chúng ta cần gửi dữ liệu
    // dưới dạng `FormData` để server có thể đọc được.
    const postData = new FormData();
    for (const key in formData) {
      postData.append(key, formData[key]);
    }

    try {
      const response = await fetch('http://localhost/Library/Connection/actions/action.php?action=AddAdmin', {
        method: 'POST',
        body: postData,
      });

      if (!response.ok) {
        throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
      }

      const result = await response.json();
      setMessage(result.message); // Hiển thị thông báo từ server

      if (result.success) {
        // Xóa dữ liệu trong form sau khi thêm thành công
        setFormData({
          AdminName: '',
          AdminGmail: '',
          AdminPassword: '',
          AdminAge: '',
          AdminGender: 'M',
        });
      }
    } catch (error) {
      console.error('Lỗi khi gửi form:', error);
      setMessage('Đã có lỗi xảy ra khi gửi form. Vui lòng kiểm tra console.');
    }
  };

  return (
    <>
    <section className="container-add-admin">
      <h2>Thêm Admin Mới</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
        <input
          type="text"
          name="AdminName"
          placeholder="Tên Admin"
          value={formData.AdminName}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="AdminGmail"
          placeholder="Gmail"
          value={formData.AdminGmail}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="AdminPassword"
          placeholder="Mật khẩu"
          value={formData.AdminPassword}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="AdminAge"
          placeholder="Tuổi"
          value={formData.AdminAge}
          onChange={handleChange}
          required
        />
        <select name="AdminGender" value={formData.AdminGender} onChange={handleChange} required>
          <option value="M">Nam</option>
          <option value="F">Nữ</option>
        </select>
        <button type="submit" className="btn">Thêm Admin</button>
      </form>
      {message && <p style={{ marginTop: '1rem', color: message.includes('thành công') ? 'green' : 'red' }}>{message}</p>}
    </section>

      <hr />
  </>
  );
}

// Component để hiển thị danh sách các admin hiện tại
function GetAdmin() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editFormData, setEditFormData] = useState(null);

  const handleGetAdminById = async (AdminID) => {
    try {
      const response = await fetch(`http://localhost/Library/Connection/actions/action.php?action=getAdminById&AdminID=${AdminID}`);
      if (!response.ok) {
        throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        setSelectedAdmin(result.data);
      } else {
        alert(`Lỗi: ${result.message}`);
        setSelectedAdmin(null);
      }
    } catch (err) {
      console.error('Lỗi khi lấy chi tiết admin:', err);
      alert('Đã có lỗi xảy ra khi lấy chi tiết admin.');
      setSelectedAdmin(null);
    }
  };

  const handleDelete = async (adminId) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa admin có ID: ${adminId}?`)) {
      return;
    }

    const postData = new FormData();
    postData.append('AdminID', adminId);

    try {
      const response = await fetch('http://localhost/Library/Connection/actions/action.php?action=DeleteAdmin', {
        method: 'POST',
        body: postData,
      });

      if (!response.ok) {
        throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setAdmins(currentAdmins => currentAdmins.filter(admin => admin.AdminID !== adminId));
        alert(result.message);
      } else {
        alert(`Lỗi: ${result.message}`);
      }
    } catch (err) {
      console.error('Lỗi khi xóa admin:', err);
      alert('Đã có lỗi xảy ra khi thực hiện yêu cầu xóa.');
    }
  };

  // Khi nhấn nút "Sửa", hiển thị form và điền dữ liệu
  const handleEditClick = (admin) => {
    setEditingAdmin(admin);
    setEditFormData({ ...admin });
    setSelectedAdmin(null); // Ẩn phần chi tiết nếu đang mở
  };

  // Xử lý thay đổi trên form sửa
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Xử lý khi submit form sửa
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData) return;

    const postData = new FormData();
    // Đảm bảo gửi cả AdminID
    for (const key in editFormData) {
      postData.append(key, editFormData[key]);
    }

    try {
      const response = await fetch('http://localhost/Library/Connection/actions/action.php?action=UpdateAdmin', {
        method: 'POST',
        body: postData,
      });

      if (!response.ok) {
        throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
      }

      const result = await response.json();
      alert(result.message);

      if (result.success) {
        // Cập nhật lại danh sách admin trên UI
        setAdmins(currentAdmins =>
          currentAdmins.map(admin =>
            admin.AdminID === editFormData.AdminID ? { ...admin, ...editFormData } : admin
          )
        );
        setEditingAdmin(null); // Đóng form sửa
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật admin:', err);
      alert('Đã có lỗi xảy ra khi cập nhật.');
    }
  };

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        // Giả sử action để lấy danh sách admin là 'getAdmins'
        const response = await fetch('http://localhost/Library/Connection/actions/action.php?action=getAdmins');
        if (!response.ok) {
          throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
        }
        const data = await response.json();
        // Giả sử PHP trả về { success: true, data: [...] }
        if (data.success) {
          setAdmins(data.data);
        } else {
          throw new Error(data.message || 'Không thể lấy danh sách admin');
        }
      } catch (error) {
        setError(error.message);
        console.error('Lỗi khi lấy danh sách admin:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy 1 lần

  if (loading) return <p>Đang tải danh sách admin...</p>;
  if (error) return <p style={{ color: 'red' }}>Lỗi: {error}</p>;

  return (   
    <>
      <section className="container-list-admin">
        <h2>Danh sách Admin</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Gmail</th>
              <th>Tuổi</th>
              <th>Giới tính</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.AdminID}>
                <td>{admin.AdminID}</td>
                <td>{admin.AdminName}</td>
                <td>{admin.AdminGmail}</td>
                <td>{admin.AdminAge}</td>
                <td>{admin.AdminGender === 'M' ? 'Nam' : 'Nữ'}</td>
                <td>
                  <button onClick={() => handleDelete(admin.AdminID)}>Xóa</button>
                  <button onClick={() => handleGetAdminById(admin.AdminID)}>Chi tiết</button>                  
                  <button onClick={() => handleEditClick(admin)}>Sửa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {editingAdmin && (
        <section className="container-add-admin">
          <h3>Sửa thông tin Admin: {editingAdmin.AdminName}</h3>
          <form onSubmit={handleUpdateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
            <input
              type="text"
              name="AdminName"
              placeholder="Tên Admin"
              value={editFormData.AdminName}
              onChange={handleEditFormChange}
              required
            />
            <input
              type="email"
              name="AdminGmail"
              placeholder="Gmail"
              value={editFormData.AdminGmail}
              onChange={handleEditFormChange}
              required
            />
            <input
              type="password"
              name="AdminPassword"
              placeholder="Mật khẩu mới (để trống nếu không đổi)"
              onChange={handleEditFormChange}
            />
            <input
              type="number"
              name="AdminAge"
              placeholder="Tuổi"
              value={editFormData.AdminAge}
              onChange={handleEditFormChange}
              required
            />
            <select name="AdminGender" value={editFormData.AdminGender} onChange={handleEditFormChange} required>
              <option value="M">Nam</option>
              <option value="F">Nữ</option>
            </select>
            <div>
              <button type="submit" className="btn">Cập nhật</button>
              <button type="button" className="btn" onClick={() => setEditingAdmin(null)} style={{ marginLeft: '1rem', backgroundColor: '#6c757d' }}>Hủy</button>
            </div>
          </form>
        </section>
      )}

      {selectedAdmin && (
        <section className="container-list-admin">
          <h3>Chi tiết Admin: {selectedAdmin.AdminName}</h3>
          <div>
            <p><strong>ID:</strong> {selectedAdmin.AdminID}</p>
            <p><strong>Tên:</strong> {selectedAdmin.AdminName}</p>
            <p><strong>Gmail:</strong> {selectedAdmin.AdminGmail}</p>
            <p><strong>Tuổi:</strong> {selectedAdmin.AdminAge}</p>
            <p><strong>Giới tính:</strong> {selectedAdmin.AdminGender === 'M' ? 'Nam' : 'Nữ'}</p>
            <p><strong>Ngày tạo:</strong> {new Date(selectedAdmin.CreatedAt).toLocaleString()}</p>
            <button onClick={() => setSelectedAdmin(null)}>Đóng</button>
          </div>
        </section>
      )}
    </>
  );
}

function AdminManager() {
  return (
    <>
      <AddAdminForm />
      <GetAdmin />
    </>
  );
}

export default AdminManager;