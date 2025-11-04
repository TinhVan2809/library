import { useState, useEffect } from "react";

function HandlePublishers() {
    const [publisher, setPubliser] = useState([]);
    const [countPublisher, setCountPublisher] = useState(0);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [newPublisher, setNewPublisher] = useState({
        PublisherName: '', Address: '', Phone: '', Email: '', Website: ''
    });
    const [editingPublisherId, setEditingPublisherId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        PublisherID: '', PublisherName: '', Address: '', Phone: '', Email: '', Website: ''
    });


    useEffect(() => {
        const fetchPublisherData = async () => {
            try{
                const [publisherRes, countPublisherRes] = await Promise.all([
                    fetch('http://localhost/Library/Connection/actions/actionForPublishers.php?action=GetPublishers'),
                    fetch('http://localhost/Library/Connection/actions/actionForPublishers.php?action=getCountPublishers'),

                ]); 

                if(!publisherRes.ok) throw new Error(`Lỗi HTTP: ${publisherRes.status}`);

                const result = await publisherRes.json();
                const resultCount = await countPublisherRes.json();

                if(result.success && result.data) {
                    setPubliser(result.data);
                } else {
                    throw new Error(result.message || "Không thể tải dữ liệu nhà xuất bản");
                }

                 const extractCount = (data) => {
          if (data == null) return 0;
          if (typeof data === 'number') return data;
          if (typeof data === 'string' && /^\d+$/.test(data)) return parseInt(data, 10);
          if (typeof data === 'object') {
            if ('total_authors' in data) return parseInt(data.total_authors, 10) || 0;
            if ('COUNT(AuthorID)' in data) return parseInt(data['COUNT(AuthorID)'], 10) || 0;
            // try any single numeric property
            const keys = Object.keys(data);
            for (let k of keys) {
              const v = data[k];
              if (typeof v === 'number') return v;
              if (typeof v === 'string' && /^\d+$/.test(v)) return parseInt(v, 10);
            }
          }
          return 0;
        };

         if (resultCount.success) {
          const total = extractCount(resultCount.data);
          setCountPublisher(total);
        } else {
          throw new Error(resultCount.message || "Không thể tải tổng số nhà xuất bản.");
        }

            } catch(err) {
                console.error('Lỗi không thể tải dữ liệu nhà xuất bản', err);
                setError(null);
            } finally{
                setLoading(false);
            }
        };
        fetchPublisherData();
    }, [publisher.length]); // Chạy lại khi độ dài mảng publisher thay đổi (sau khi thêm/xóa)

    if (loading) return (
    <>
     
      <section className="dots-container">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </section>

    </>
  );

     if(error) {
        return(
            <>
                <p>{error.message}</p>
            </>
        )
    }

    // THÊM NXB
    const handleNewPublisherChange = (e) => {
        const { name, value } = e.target;
        setNewPublisher(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleAddNewPublisher = async (e) => {
        e.preventDefault();
        if (!newPublisher.PublisherName.trim()) {
            alert('Tên nhà xuất bản là bắt buộc.');
            return;
        }

        try {
            const params = new URLSearchParams();
            params.append('action', 'AddPublishers');
            for (const key in newPublisher) {
                params.append(key, newPublisher[key]);
            }

            const res = await fetch('http://localhost/Library/Connection/actions/actionForPublishers.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString(),
            });

            const result = await res.json();
            if (!res.ok || !result.success) throw new Error(result.message || `HTTP ${res.status}`);

            alert(result.message || 'Đã thêm thành công!');
            setPubliser(prev => [...prev, { ...newPublisher, PublisherID: result.newId || Date.now() }]); // Cập nhật tạm thời UI
            setNewPublisher({ PublisherName: '', Address: '', Phone: '', Email: '', Website: '' }); // Reset form
        } catch (err) {
            console.error('Add Publisher error: ', err);
            alert(`Lỗi khi thêm: ${err.message}`);
        }
    };

    //SỬA NXB

    const handleEditClick = (publisher) => {
        setEditingPublisherId(publisher.PublisherID);
        setEditFormData(publisher);
    };

    const handleCancelEdit = () => {
        setEditingPublisherId(null);
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleUpdatePublisher = async (e) => {
        e.preventDefault();
        if (!editFormData.PublisherName.trim()) {
            alert('Tên nhà xuất bản không được để trống.');
            return;
        }

        try {
            const params = new URLSearchParams();
            params.append('action', 'UpdatePublishers');
            for (const key in editFormData) {
                params.append(key, editFormData[key]);
            }

            const res = await fetch('http://localhost/Library/Connection/actions/actionForPublishers.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString(),
            });

            const result = await res.json();
            if (!res.ok || !result.success) throw new Error(result.message || `HTTP ${res.status}`);

            alert(result.message || 'Cập nhật thành công!');
            setPubliser(prev => prev.map(p => (p.PublisherID === editingPublisherId ? editFormData : p)));
            setEditingPublisherId(null);
        } catch (err) {
            console.error('Update Publisher error: ', err);
            alert(`Lỗi khi cập nhật: ${err.message}`);
        }
    };

    // XÓA NXB
    const handleDeletePublisher = async (PublisherID) => {
        if(!window.confirm('Xác nhận xóa nbx này.')) return;

        try{
            const params = new URLSearchParams();
            params.append('action', 'DeletePublisher');
            params.append('PublisherID', String(PublisherID));

            const res = await fetch('http://localhost/Library/Connection/actions/actionForPublishers.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
                body: params.toString(),
            });

            const result = await res.json();
            if(!res.ok) throw new Error(result.message || `HTTP ${res.status}`);

            alert(result.message || 'Đã xóa');
            setPubliser(prev => prev.filter(p => p.PublisherID !== PublisherID)); // Cập nhật UI
        } catch(err) {
            console.error('Delete Publisher error: ', err);
            alert(`Lỗi khi xóa: ${err.message}`);
        }
    }



    return (

        <>

        <section className="container-add-admin">
            <h3>Thêm Nhà Xuất Bản Mới</h3>
            <form onSubmit={handleAddNewPublisher} className="form-add-publisher">
                <input type="text" name="PublisherName" placeholder="Tên Nhà Xuất Bản (*)" value={newPublisher.PublisherName} onChange={handleNewPublisherChange} required />
                <input type="text" name="Address" placeholder="Địa chỉ" value={newPublisher.Address} onChange={handleNewPublisherChange} />
                <input type="tel" name="Phone" placeholder="Số điện thoại" value={newPublisher.Phone} onChange={handleNewPublisherChange} />
                <input type="email" name="Email" placeholder="Email" value={newPublisher.Email} onChange={handleNewPublisherChange} />
                <input type="url" name="Website" placeholder="Website" value={newPublisher.Website} onChange={handleNewPublisherChange} />
                <button type="submit" className="btn">Thêm NXB</button>
            </form>
        </section>

        <hr />
        {error && <div className="error-message">{error}</div>}
      <h3>Tổng: {publisher.length} nhà xuất bản</h3>

        <section>
            <table className="table-container">
                <thead>
                    <tr>
                        <th><input type="radio" /></th>
                        <th>Publiher Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                  {publisher.map((p) => (
                    <tr key={p.PublisherID}>
                        {editingPublisherId === p.PublisherID ? (
                            // Chế độ sửa
                            <td colSpan="5">
                                <form onSubmit={handleUpdatePublisher} className="form-edit-inline">
                                    <input type="text" name="PublisherName" value={editFormData.PublisherName} onChange={handleEditFormChange} required />
                                    <input type="text" name="Address" value={editFormData.Address} onChange={handleEditFormChange} placeholder="Địa chỉ" />
                                    <input type="text" name="Phone" value={editFormData.Phone} onChange={handleEditFormChange} placeholder="Điện thoại" />
                                    <input type="email" name="Email" value={editFormData.Email} onChange={handleEditFormChange} placeholder="Email" />
                                    <input type="text" name="Website" value={editFormData.Website} onChange={handleEditFormChange} placeholder="Website" />
                                    <button type="submit" className="btn-save">Lưu</button>
                                    <button type="button" className="btn-cancel" onClick={handleCancelEdit}>Hủy</button>
                                </form>
                            </td>
                        ) : (
                            // Chế độ xem
                            <>
                                <td><input type="radio" name="selected_publisher" /></td>
                                <td>{p.PublisherName}</td>
                                <td>{p.Email || 'Không có'}</td>
                                <td>{p.Phone || 'Không có'}</td>
                                <td>
                                    <div className="table-container-btn">
                                        <button className="btn-edit" onClick={() => handleEditClick(p)}>Sửa</button>
                                        <button className="btn-delete" onClick={() => handleDeletePublisher(p.PublisherID)}>Xóa</button>
                                    </div>
                                </td>
                            </>
                        )}
                    </tr>
                  ))}
                </tbody>
            </table>
        </section>

           
        </>
    );
}

export default HandlePublishers;