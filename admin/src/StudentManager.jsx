import React, { useState, useEffect } from 'react';

// Component quản lý Sinh viên (đang xây dựng)
// Các component tạm thời để hiển thị nội dung cho mỗi tab
// const StudentList = () => <div>Nội dung quản lý Sinh Viên sẽ được thêm ở đây.</div>;
// Component quản lý sinh viên
function StudentList() {
  const [students, setStudents] = useState([]);
  const [majors, setMajors] = useState([]); // State cho danh sách ngành
  const [selectedStudent, setSelectedStudent] = useState(null); // State cho sinh viên được chọn xem chi tiết
  const [editingStudent, setEditingStudent] = useState(null); // State cho sinh viên đang sửa
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    StudentCode: '',
    FullName: '',
    Gender: 'M',
    DateOfBirth: '',
    Email: '',
    Phone: '',
    Address: '',
    EnrollmentYear: '',
    MajorID: '',
    FacultyID: '',
    Status: '',
  });
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsRes, majorsRes, facultiesRes] = await Promise.all([
        fetch('http://localhost/Library/Connection/actions/actionForStudent.php?action=GetStudent'),
        fetch('http://localhost/Library/Connection/actions/actionForMajor.php?action=getMajors'),
        fetch('http://localhost/Library/Connection/actions/actionForFaculty.php?action=getFaculties')
      ]);
      const studentsData = await studentsRes.json();
      const majorsData = await majorsRes.json();
      const facultiesData = await facultiesRes.json();

      if (majorsData.success) setMajors(Array.isArray(majorsData.data) ? majorsData.data : []);
      else setError(majorsData.message);

      if (facultiesData.success) setFaculties(Array.isArray(facultiesData.data) ? facultiesData.data : []);
      else setError(facultiesData.message);
      
      if (studentsData.success) setStudents(Array.isArray(studentsData.data) ? studentsData.data : []);
      else setError(studentsData.message);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  //sửa và thêm sách
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const postData = new FormData();
    for (const key in formData) {
      // Chỉ gửi dữ liệu nếu nó không rỗng
      if (formData[key]) {
        postData.append(key, formData[key]);
      }
    }

    const action = editingStudent ? 'UpdateStudent' : 'AddStudent';
    if (editingStudent) {
      postData.append('StudentID', editingStudent.StudentID);
    }

    try {
      const response = await fetch(`http://localhost/Library/Connection/actions/actionForStudent.php?action=${action}`, {
        method: 'POST',
        body: postData,
      });
      const result = await response.json();
      setMessage(result.message);
      if (result.success) {
        fetchData(); // Tải lại danh sách
        resetForm(); // Reset form và thoát chế độ sửa
      }
    } catch (err) {
      const errorText = await err.response?.text();
      console.error("Lỗi khi gửi form. Dữ liệu nhận được:", errorText);
      setMessage('Lỗi: ' + err.message + ". Kiểm tra console để biết thêm chi tiết.");
    }
  };

  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (error) return <p style={{ color: 'red' }}>Lỗi: {error}</p>;

  
  // Hàm xử lý xem chi tiết sinh viên theo ID
  const handleGetStudentById = async (studentId) => {
    setEditingStudent(null); // Đóng form sửa khi xem chi tiết
    try { // Sửa lỗi chính tả: getStudentyById -> getStudentById
      const response = await fetch(`http://localhost/Library/Connection/actions/actionForStudent.php?action=getStudentyById&StudentID=${studentId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Lỗi HTTP! Trạng thái: ${response.status}`);
      }

      if (result.success) {
        setSelectedStudent(result.data);
      } else {
        alert(`Lỗi: ${result.message}`);
        setSelectedStudent(null);
      }
    } catch (err) {
      console.error('Lỗi khi lấy chi tiết khoa:', err);
      alert(`Lỗi: ${err.message}`);
      setSelectedStudent(null);
    }
  }

  // Hàm xử lý khi nhấn nút "Xóa"
  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sinh viên này?')) {
      return;
    }

    const postData = new FormData();
    postData.append('StudentID', studentId);

    try {
      const response = await fetch('http://localhost/Library/Connection/actions/actionForStudent.php?action=DeleteStudent', {
        method: 'POST',
        body: postData,
      });
      const result = await response.json();
      alert(result.message);
      if (result.success) {
        fetchData();
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  // Hàm xử lý khi nhấn nút "Sửa"
  const handleEditClick = (student) => {
    setEditingStudent(student);
    setSelectedStudent(null); // Đóng chi tiết khi mở form sửa
    // Điền dữ liệu của sinh viên vào form
    setFormData({
      StudentCode: student.StudentCode || '',
      FullName: student.FullName || '',
      Gender: student.Gender || 'M',
      DateOfBirth: student.DateOfBirth || '',
      Email: student.Email || '',
      Password: student.Password || '',
      Phone: student.Phone || '',
      Address: student.Address || '',
      EnrollmentYear: student.EnrollmentYear || '',
      MajorID: student.MajorID || '',
      FacultyID: student.FacultyID || '',
      Status: student.Status || '',
    });
  };

  // Hàm reset form và thoát chế độ sửa
  const resetForm = () => {
    setEditingStudent(null);
    setFormData({ StudentCode: '', FullName: '', Gender: 'M', DateOfBirth: '', Email: '', Phone: '', Address: '', EnrollmentYear: '', MajorID: '', FacultyID: '', Status: '' });
  };

 return (
  <>
    <StudentForm 
      formData={formData}
      handleSubmit={handleSubmit}
      handleChange={handleChange}
      editingStudent={editingStudent}
      faculties={faculties}
      majors={majors}
      message={message}
      onCancel={resetForm}
    />
    <hr />
    <section className="container-list-admin">
      <h2>Danh sách Sinh viên</h2>
      <table>
        <thead>
          <tr><th>Mã SV</th>
            <th>Họ Tên</th>
            <th>Email</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => (
            <tr key={student.StudentID}>
              <td>{student.StudentCode}</td>
              <td>{student.FullName}</td>
              <td>{student.Email ? student.Email : 'Không có'}</td>
              <td>

                <button onClick={() => handleEditClick(student)}>Sửa</button>
                <button onClick={() => handleDeleteStudent(student.StudentID)}>Xóa</button>
                <button onClick={() => handleGetStudentById(student.StudentID)}>Chi tiết</button>
                <button>Tạo phiếu mượn</button>

              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>

    {selectedStudent && (
      <div className="selectedStudent" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px' }}>
        <strong>ID: {selectedStudent.StudentID}</strong>
        <strong>MSSV: {selectedStudent.StudentCode} </strong>
        <strong>Tên: {selectedStudent.FullName}</strong>
        <strong>Giới tính: {selectedStudent.Gender}</strong>
        <strong>Năm sinh: {selectedStudent.DateOfBirth}</strong>
        <strong>Email: {selectedStudent.Email}</strong>
        <strong>Password: {selectedStudent.Password}</strong>
        <strong>Phone: {selectedStudent.Phone}</strong>
        <strong>Địa chỉ: {selectedStudent.Address}</strong>
        <strong>Năm tuyển sinh: {selectedStudent.EnrollmentYear}</strong>
        <strong>Ngành: {selectedStudent.MajorName}</strong>
        <strong>Khoa: {selectedStudent.FacultyName}</strong>
        <strong>Trạng thái: {selectedStudent.Status}</strong>

        <button onClick={() => setSelectedStudent(null)} style={{ marginTop: '1rem' }}>Đóng</button>
      
      </div>
    )}
  </>
 )
}

// component form cho sinh viên
function StudentForm({formData, editingStudent, handleSubmit, handleChange, majors, faculties, onCancel, message}) {
  return (
   <section className="container-add-admin">
      <h2>{editingStudent ? 'Sửa thông tin Sinh viên' : 'Thêm Sinh viên Mới'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px' }}>
        <input type="text" name="StudentCode" placeholder="Mã sinh viên" value={formData.StudentCode} onChange={handleChange} required />
        <input type="text" name="FullName" placeholder="Tên sinh viên" value={formData.FullName} onChange={handleChange} required />
        <select name="Gender" value={formData.Gender} onChange={handleChange} required>
          <option value="M">Nam</option>
          <option value="F">Nữ</option>
        </select>
        <input type="date" name="DateOfBirth" placeholder="Ngày tháng năm sinh" value={formData.DateOfBirth} onChange={handleChange} required />
        <input type="email" name="Email" placeholder="Email" value={formData.Email} onChange={handleChange} />
        <input type="password" name='Password' placeholder='Password' value={formData.Password} onChange={handleChange} />
        <input type="tel" name="Phone" placeholder="Số điện thoại" value={formData.Phone} onChange={handleChange} />
        <input type="text" name="Address" placeholder="Địa chỉ" value={formData.Address} onChange={handleChange} />
        <input type="number" name="EnrollmentYear" placeholder="Năm tuyển sinh" value={formData.EnrollmentYear} onChange={handleChange} />
        
        <select name="FacultyID" value={formData.FacultyID} onChange={handleChange} required> {/* Dropdown cho Khoa */}
          <option value="">-- Chọn Khoa --</option>
          {faculties.map(faculty => (
            <option key={faculty.FacultyID} value={faculty.FacultyID}>{faculty.FacultyName}</option>
          ))}
        </select>

       <select name="MajorID" value={formData.MajorID} onChange={handleChange} required> {/* Dropdown cho Ngành */}
          <option value="">-- Chọn Ngành --</option>
          {majors.map(major => (
            <option key={major.MajorID} value={major.MajorID}>{major.MajorName}</option>
          ))}
        </select>
       
        <input type="text" name="Status" placeholder="Trạng thái" value={formData.Status} onChange={handleChange} />
        <div>
          <button type="submit" className="btn">{editingStudent ? 'Cập nhật' : 'Thêm Sinh Viên'}</button>
          {editingStudent && (
            <button type="button" className="btn" onClick={onCancel} style={{ marginLeft: '1rem', backgroundColor: '#6c757d' }}>Hủy</button>
          )}
        </div>
      </form>
      {message && <p style={{ marginTop: '1rem', color: message.toLowerCase().includes('thành công') ? 'green' : 'red' }}>{message}</p>}
    </section>
  )
}

// Component Form cho Ngành
function MajorForm({ formData, editingMajor, handleSubmit, handleChange, onCancel, message, faculties }) {
  return (
    <section className="container-add-admin">
      <h2>{editingMajor ? 'Sửa thông tin Ngành' : 'Thêm Ngành Mới'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px' }}>
        <input type="text" name="MajorCode" placeholder="Mã Ngành" value={formData.MajorCode} onChange={handleChange} required />
        <input type="text" name="MajorName" placeholder="Tên Ngành" value={formData.MajorName} onChange={handleChange} required />
        <select name="FacultyID" value={formData.FacultyID} onChange={handleChange} required>
          <option value="">-- Chọn Khoa --</option>
          {faculties.map(faculty => (
            <option key={faculty.FacultyID} value={faculty.FacultyID}>{faculty.FacultyName}</option>
          ))}
        </select>
        <input type="text" name="TrainingLevel" placeholder="Trình độ đào tạo" value={formData.TrainingLevel} onChange={handleChange} />
        <input type="number" name="CreditsRequired" placeholder="Số tín chỉ yêu cầu" value={formData.CreditsRequired} onChange={handleChange} />
        <textarea name="Description" placeholder="Mô tả" value={formData.Description} onChange={handleChange} />
        <div>
          <button type="submit" className="btn">{editingMajor ? 'Cập nhật' : 'Thêm Ngành'}</button>
          {editingMajor && (
            <button type="button" className="btn" onClick={onCancel} style={{ marginLeft: '1rem', backgroundColor: '#6c757d' }}>Hủy</button>
          )}
        </div>
      </form>
      {message && <p style={{ marginTop: '1rem', color: message.includes('thành công') ? 'green' : 'red' }}>{message}</p>}
    </section>
  );
}

// Component quản lý Ngành
function MajorManager() {
  const [majors, setMajors] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [editingMajor, setEditingMajor] = useState(null);
  const [selectedMajor, setSelectedMajor] = useState(null); // State cho ngành được chọn xem chi tiết
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    MajorCode: '',
    MajorName: '',
    FacultyID: '',
    TrainingLevel: '',
    CreditsRequired: '',
    Description: '',
  });
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [majorsRes, facultiesRes] = await Promise.all([
        fetch('http://localhost/Library/Connection/actions/actionForMajor.php?action=getMajors'),
        fetch('http://localhost/Library/Connection/actions/actionForFaculty.php?action=getFaculties')
      ]);
      const majorsData = await majorsRes.json();
      const facultiesData = await facultiesRes.json();

      if (majorsData.success) setMajors(Array.isArray(majorsData.data) ? majorsData.data : []);
      else setError(majorsData.message);

      if (facultiesData.success) setFaculties(Array.isArray(facultiesData.data) ? facultiesData.data : []);
      else setError(facultiesData.message);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const resetForm = () => {
    setEditingMajor(null);
    setFormData({ MajorCode: '', MajorName: '', FacultyID: '', TrainingLevel: '', CreditsRequired: '', Description: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const postData = new FormData();
    for (const key in formData) postData.append(key, formData[key]);

    const action = editingMajor ? 'updateMajor' : 'addMajor';
    if (editingMajor) postData.append('MajorID', editingMajor.MajorID);

    try {
      const response = await fetch(`http://localhost/Library/Connection/actions/actionForMajor.php?action=${action}`, {
        method: 'POST', body: postData,
      });
      const result = await response.json();
      setMessage(result.message);
      if (result.success) {
        fetchData();
        resetForm();
      }
    } catch (err) {
      setMessage('Lỗi: ' + err.message);
    }
  };

  const handleEditClick = (major) => {
    setEditingMajor(major);
    setSelectedMajor(null); // Đóng chi tiết khi mở form sửa
    setFormData({ ...major, Description: major.Description || '' });
  };

  const handleDelete = async (majorId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa ngành này?')) return;
    const postData = new FormData();
    postData.append('MajorID', majorId);
    try {
      const response = await fetch('http://localhost/Library/Connection/actions/actionForMajor.php?action=deleteMajor', {
        method: 'POST', body: postData,
      });
      const result = await response.json();
      alert(result.message);
      if (result.success) fetchData();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  // Hàm lấy chi tiết ngành theo ID
  const handleGetMajorById = async (majorId) => {
    setEditingMajor(null); // Đóng form sửa khi xem chi tiết
    try {
      const response = await fetch(`http://localhost/Library/Connection/actions/actionForMajor.php?action=getMajorById&MajorID=${majorId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Lỗi HTTP! Trạng thái: ${response.status}`);
      }

      if (result.success) {
        setSelectedMajor(result.data);
      } else {
        alert(`Lỗi: ${result.message}`);
      }
    } catch (err) {
      console.error('Lỗi khi lấy chi tiết ngành:', err);
      alert(`Lỗi: ${err.message}`);
    }
  };

  return (
    <div>
      <MajorForm formData={formData} editingMajor={editingMajor} handleSubmit={handleSubmit} handleChange={handleChange} onCancel={resetForm} message={message} faculties={faculties} />
      <hr />
      <section className="container-list-admin">
        <h2>Danh sách Ngành</h2>
        {loading && <p>Đang tải...</p>}
        {error && <p style={{ color: 'red' }}>Lỗi: {error}</p>}
        <table>
          <thead><tr><th>Mã Ngành</th><th>Tên Ngành</th><th>Tên Khoa</th><th>Hành động</th></tr></thead>
          <tbody>
            {majors.filter(major => major).map(major => ( // Lọc các giá trị null/undefined
              <tr key={major.MajorID}>
                <td>{major.MajorCode}</td>
                <td>{major.MajorName}</td>
                <td>{major.FacultyName}</td>
                <td>
                  <button onClick={() => handleEditClick(major)}>Sửa</button>
                  <button onClick={() => handleGetMajorById(major.MajorID)}>Chi tiết</button>
                  <button onClick={() => handleDelete(major.MajorID)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {selectedMajor && (
        <div className='major-detail' style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ccc' }}>
          <h3>Chi tiết Ngành: {selectedMajor.MajorName}</h3>
          <p><strong>ID:</strong> {selectedMajor.MajorID}</p>
          <p><strong>Mã Ngành:</strong> {selectedMajor.MajorCode}</p>
          <p><strong>Tên Ngành:</strong> {selectedMajor.MajorName}</p>
          <p><strong>Khoa:</strong> {selectedMajor.FacultyName}</p>
          <p><strong>Trình độ đào tạo:</strong> {selectedMajor.TrainingLevel || 'N/A'}</p>
          <p><strong>Số tín chỉ yêu cầu:</strong> {selectedMajor.CreditsRequired || 'N/A'}</p>
          <p><strong>Mô tả:</strong> {selectedMajor.Description || 'Không có'}</p>
          <button onClick={() => setSelectedMajor(null)} style={{ marginTop: '1rem' }}>Đóng</button>
        </div>
      )}
    </div>
  );
}
// Component Form cho Khoa (đã được tách ra)
function FacultyForm({ formData, editingFaculty, handleSubmit, handleChange, onCancel, message }) {
  return (
    <section className="container-add-admin">
      <h2>{editingFaculty ? 'Sửa thông tin Khoa' : 'Thêm Khoa Mới'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px' }}>
        <input type="text" name="FacultyCode" placeholder="Mã Khoa" value={formData.FacultyCode} onChange={handleChange} required />
        <input type="text" name="FacultyName" placeholder="Tên Khoa" value={formData.FacultyName} onChange={handleChange} required />
        <input type="tel" name="Phone" placeholder="Số điện thoại" value={formData.Phone} onChange={handleChange} />
        <input type="email" name="Email" placeholder="Email" value={formData.Email} onChange={handleChange} />
        <input type="text" name="Address" placeholder="Địa chỉ" value={formData.Address} onChange={handleChange} />
        <input type="number" name="EstablishedYear" placeholder="Năm thành lập" value={formData.EstablishedYear} onChange={handleChange} />
        <div>
          <button type="submit" className="btn">{editingFaculty ? 'Cập nhật' : 'Thêm Khoa'}</button>
          {editingFaculty && (
            <button type="button" className="btn" onClick={onCancel} style={{ marginLeft: '1rem', backgroundColor: '#6c757d' }}>Hủy</button>
          )}
        </div>
      </form>
      {message && <p style={{ marginTop: '1rem', color: message.includes('thành công') ? 'green' : 'red' }}>{message}</p>}
    </section>
  );
}
// Component quản lý Khoa
function FacultyManager() {
  const [faculties, setFaculties] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null); // State cho khoa được chọn xem chi tiết
  const [editingFaculty, setEditingFaculty] = useState(null); // State cho khoa đang sửa
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    FacultyCode: '',
    FacultyName: '',
    Phone: '',
    Email: '',
    Address: '',
    EstablishedYear: '',
  });
  const [message, setMessage] = useState('');

  const fetchFaculties = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost/Library/Connection/actions/actionForFaculty.php?action=getFaculties');
      const data = await response.json();
      if (data.success) {
      setFaculties(Array.isArray(data.data) ? data.data : []);
        console.log("Danh sách faculties:", data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const postData = new FormData();
    for (const key in formData) {
      postData.append(key, formData[key]);
    }

    const action = editingFaculty ? 'updateFaculty' : 'addFaculty';

    try {
      // Chỉ thêm FacultyID khi đang cập nhật
      if (editingFaculty) {
        postData.append('FacultyID', editingFaculty.FacultyID);
      }

      const response = await fetch(`http://localhost/Library/Connection/actions/actionForFaculty.php?action=${action}`, {
        method: 'POST',
        body: postData,
      });
      const result = await response.json();
      setMessage(result.message);

      if (result.success) {
        fetchFaculties(); // Tải lại danh sách khoa
        setEditingFaculty(null); // Thoát chế độ sửa
        setFormData({ // Reset form
          FacultyCode: '',
          FacultyName: '',
          Phone: '',
          Email: '',
          Address: '',
          EstablishedYear: '',
        });
      }
    } catch (err) {
      setMessage('Lỗi: ' + err.message);
    }
  };

  // Hàm xử lý khi nhấn nút "Sửa"
  const handleEditClick = (faculty) => {
    setEditingFaculty(faculty);
    setSelectedFaculty(null); // Đóng chi tiết khi mở form sửa
    setFormData({
      FacultyCode: faculty.FacultyCode,
      FacultyName: faculty.FacultyName,
      Phone: faculty.Phone || '',
      Email: faculty.Email || '',
      Address: faculty.Address || '',
      EstablishedYear: faculty.EstablishedYear || '',
    });
  };

  // Hàm xử lý khi nhấn nút "Hủy"
  const handleCancelEdit = () => {
    setEditingFaculty(null);
    setFormData({
      FacultyCode: '', FacultyName: '', Phone: '', Email: '', Address: '', EstablishedYear: '',
    });
  };

  // Hàm xử lý xem chi tiết khoa theo ID
  const handleGetFacultyById = async (facultyId) => {
    setEditingFaculty(null); // Đóng form sửa khi xem chi tiết
    try {
      const response = await fetch(`http://localhost/Library/Connection/actions/actionForFaculty.php?action=getFacultyById&FacultyID=${facultyId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Lỗi HTTP! Trạng thái: ${response.status}`);
      }

      if (result.success) {
        setSelectedFaculty(result.data);
      } else {
        alert(`Lỗi: ${result.message}`);
        setSelectedFaculty(null);
      }
    } catch (err) {
      console.error('Lỗi khi lấy chi tiết khoa:', err);
      alert(`Lỗi: ${err.message}`);
      setSelectedFaculty(null);
    }
  }

  // Hàm xử lý khi nhấn nút "Xóa"
  const handleDelete = async (facultyId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa khoa này?')) {
      return;
    }

    const postData = new FormData();
    postData.append('FacultyID', facultyId);

    try {
      const response = await fetch('http://localhost/Library/Connection/actions/actionForFaculty.php?action=deleteFaculty', {
        method: 'POST',
        body: postData,
      });
      const result = await response.json();
      alert(result.message);
      if (result.success) {
        fetchFaculties(); // Tải lại danh sách
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  return (
    <div>
      <FacultyForm
        formData={formData}
        editingFaculty={editingFaculty}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        onCancel={handleCancelEdit}
        message={message}
      />
      <hr />

      <section className="container-list-admin">
        <h2>Danh sách Khoa</h2>
        {loading && <p>Đang tải...</p>}
        {error && <p style={{ color: 'red' }}>Lỗi: {error}</p>}
        <table>
          <thead>
            <tr>
              <th>ID Khoa</th>
              <th>Mã Khoa</th>
              <th>Tên Khoa</th>
              <th>Email</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {faculties.filter(faculty => faculty !== null && faculty !== undefined).map(faculty => (
              <tr key={faculty.FacultyID}>
                <td>{faculty.FacultyID}</td>
                <td>{faculty.FacultyCode}</td>
                <td>{faculty.FacultyName}</td>
                <td>{faculty.Email}</td>
                <td>
                  <button onClick={() => handleEditClick(faculty)}>Sửa</button>                  
                  <button onClick={() => handleGetFacultyById(faculty.FacultyID)}>Chi tiết</button>
                  <button onClick={() => handleDelete(faculty.FacultyID)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {selectedFaculty && (
        <div className='faculty-detail' style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ccc' }}>
          <h3>Chi tiết Khoa: {selectedFaculty.FacultyName}</h3>
          <p><strong>ID:</strong> {selectedFaculty.FacultyID}</p>
          <p><strong>Mã Khoa:</strong> {selectedFaculty.FacultyCode}</p>
          <p><strong>Tên Khoa:</strong> {selectedFaculty.FacultyName}</p>
          <p><strong>Email:</strong> {selectedFaculty.Email || 'N/A'}</p>
          <p><strong>Số điện thoại:</strong> {selectedFaculty.Phone || 'N/A'}</p>
          <p><strong>Địa chỉ:</strong> {selectedFaculty.Address || 'N/A'}</p>
          <p><strong>Năm thành lập:</strong> {selectedFaculty.EstablishedYear || 'N/A'}</p>
          <button onClick={() => setSelectedFaculty(null)} style={{ marginTop: '1rem' }}>Đóng</button>
        </div>
      )}
    </div>
  );
}

const StudentManager = () => {
  const [activeTab, setActiveTab] = useState('student'); // Mặc định là tab 'student'

  // Hàm để render nội dung dựa trên tab đang hoạt động
  const renderContent = () => {
    switch (activeTab) {
      case 'student':
        return <StudentList />;
      case 'faculty': // Thay thế component tạm thời bằng FacultyManager
        return <FacultyManager />;
      case 'major': // Thay thế component tạm thời bằng MajorManager
        return <MajorManager />;
      default:
        return <StudentList />;
    }
  };

  return (
    <>
      <div className="student-container-btn">
        <button className={`student-btn ${activeTab === 'student' ? 'student-btn-active' : ''}`} onClick={() => setActiveTab('student')}>
          Sinh Viên
        </button>
        <button className={`student-btn ${activeTab === 'faculty' ? 'student-btn-active' : ''}`} onClick={() => setActiveTab('faculty')}>
          Khoa
        </button>
        <button className={`student-btn ${activeTab === 'major' ? 'student-btn-active' : ''}`} onClick={() => setActiveTab('major')}>
          Ngành
        </button>
      </div>
      <div className="student-content">{renderContent()}</div>
    </>
  );
};

export default StudentManager;