import React, { useState, useEffect } from 'react';

function AddSeriesForm({ onSeriesAdded }) {
    const [seriesName, setSeriesName] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // State cho ảnh bìa
    const [coverImage, setCoverImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverImage(file);
            setImagePreview(URL.createObjectURL(file));
        } else {
            setCoverImage(null);
            setImagePreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        if (!seriesName.trim()) {
            setMessage('Tên bộ sách không được để trống.');
            return;
        }
        setSubmitting(true);

        const postData = new FormData();
        postData.append('SeriesName', seriesName);
        if (coverImage) {
            postData.append('SeriesCoverImage', coverImage);
        }

        try {
            const response = await fetch('http://localhost/Library/Connection/actions/actionForBooks.php?action=addSeries', {
                method: 'POST',
                body: postData,
            });

            const result = await response.json();
            setMessage(result.message || '');

            if (result.success) {
                setSeriesName(''); // Reset form
                setCoverImage(null);
                setImagePreview(null);
                if (onSeriesAdded) {
                    // Có thể trì hoãn một chút để người dùng đọc thông báo
                    setTimeout(() => onSeriesAdded(result.data), 1500); // Truyền dữ liệu series mới
                }
            }
        } catch (err) {
            console.error('Lỗi khi thêm bộ sách:', err);
            setMessage('Đã có lỗi xảy ra khi gửi yêu cầu.');
        } finally {
            setSubmitting(false);
        }
    };
    return (
        <>
            <h2>Thêm Bộ Sách Mới</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px' }}>
                <input
                    type="text"
                    name="SeriesName"
                    placeholder="Nhập tên bộ sách (series)"
                    value={seriesName}
                    onChange={(e) => setSeriesName(e.target.value)}
                    required
                />
                <label htmlFor="series-cover">Ảnh bìa cho bộ sách (tùy chọn):</label>
                <input id="series-cover" type="file" name="SeriesCoverImage" accept="image/*" onChange={handleImageChange} />
                {imagePreview && <img src={imagePreview} alt="Xem trước" style={{ width: '100px', marginTop: '10px' }} />}

                <div>
                    <button type="submit" className="btn" disabled={submitting}>{submitting ? 'Đang xử lý...' : 'Thêm Bộ Sách'}</button>
                </div>
            </form>
            {message && <p style={{ marginTop: '1rem', color: message.includes('thành công') ? 'green' : 'red' }}>{message}</p>}
        </>
    );
}

function EditSeriesForm({ series, onFinished, onCancel }) {
    const [seriesName, setSeriesName] = useState(series.SeriesName);
    const [coverImage, setCoverImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(series.Image_background ? `http://localhost/Library/${series.Image_background}` : null);
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        if (!seriesName.trim()) {
            setMessage('Tên bộ sách không được để trống.');
            return;
        }
        setSubmitting(true);

        const postData = new FormData();
        postData.append('SeriesID', series.SeriesID);
        postData.append('SeriesName', seriesName);
        if (coverImage) {
            postData.append('SeriesCoverImage', coverImage);
        }

        try {
            const response = await fetch('http://localhost/Library/Connection/actions/actionForBooks.php?action=updateSeries', {
                method: 'POST',
                body: postData,
            });
            const result = await response.json();
            setMessage(result.message || '');
            if (result.success) {
                setTimeout(() => onFinished(), 1500);
            }
        } catch (err) {
            console.error('Lỗi khi cập nhật bộ sách:', err);
            setMessage('Đã có lỗi xảy ra khi gửi yêu cầu.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Sửa Bộ Sách</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="text"
                        name="SeriesName"
                        placeholder="Nhập tên bộ sách"
                        value={seriesName}
                        onChange={(e) => setSeriesName(e.target.value)}
                        required
                    />
                    <label htmlFor="series-cover-edit">Ảnh bìa (để trống nếu không đổi):</label>
                    <input id="series-cover-edit" type="file" name="SeriesCoverImage" accept="image/*" onChange={handleImageChange} />
                    {imagePreview && <img src={imagePreview} alt="Xem trước" style={{ width: '100px', height: 'auto', marginTop: '10px' }} />}

                    <div>
                        <button type="submit" className="btn" disabled={submitting}>{submitting ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
                        <button type="button" className="btn" onClick={onCancel} style={{ marginLeft: '1rem', backgroundColor: '#6c757d' }}>Hủy</button>
                    </div>
                </form>
                {message && <p style={{ marginTop: '1rem', color: message.includes('thành công') ? 'green' : 'red' }}>{message}</p>}
            </div>
        </div>
    );
}

function HandleSeries({ onCancel }) {
    const [seriesList, setSeriesList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingSeries, setEditingSeries] = useState(null); // State cho series đang sửa

    const fetchSeries = async () => {
        try {
            const response = await fetch('http://localhost/Library/Connection/actions/actionForBooks.php?action=getAllSeries');
            const result = await response.json();
            if (result.success) {
                setSeriesList(result.data || []);
            } else {
                throw new Error(result.message || 'Không thể tải danh sách bộ sách');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSeries();
    }, []);


function SeriesList({ series: seriesList, onDelete, onEdit }) {
    const getFullImageUrl = (path) => {
        if (!path) return '/placeholder.png'; // Return a placeholder if no image
        const SERVER_BASE = 'http://localhost/Library/';
        return `${SERVER_BASE}${path.replace(/^\/+/, '')}`;
    };
    return (
        <>

        <div className="series-container">
            <div className="series-main-content">
                {seriesList.map((series) => (
                    <div key={series.SeriesID} className='series-card'>
                        <div className="series-left">
                            <img src={getFullImageUrl(series.Image_background)} alt={series.SeriesName}/>
                        </div>
                        
                        <div className="series-right">
                            <p>{series.SeriesName}</p>
                            <div className="series-btn">
                                <button className="edit-btn" onClick={() => onEdit(series)} title="Sửa">✎</button>
                                <button className="delete-btn" onClick={() => onDelete(series.SeriesID)} title="Xóa">✖</button>
                            </div>
                        </div>
                    </div>
                ))}
                    
            </div>
        </div>
        
        </>
    );
}


    const handleSeriesAdded = () => {
        fetchSeries(); // Tải lại danh sách sau khi thêm thành công
    };

    const handleDeleteSeries = async (seriesId) => {
        if (!window.confirm(`Bạn có chắc muốn xóa bộ sách này? Các sách thuộc bộ này sẽ không còn liên kết nữa.`)) {
            return;
        }
        try {
            const postData = new FormData();
            postData.append('SeriesID', seriesId);
            const response = await fetch('http://localhost/Library/Connection/actions/actionForBooks.php?action=deleteSeries', { method: 'POST', body: postData });
            const result = await response.json();
            alert(result.message);
            if (result.success) {
                fetchSeries(); // Tải lại danh sách
            }
        } catch (err) {
            alert('Lỗi khi xóa bộ sách: ' + err.message);
        }
    };

    const handleEditFinished = () => {
        setEditingSeries(null);
        fetchSeries(); // Tải lại danh sách để cập nhật thay đổi
    };

    return (
        <section className="container-add-admin">
            <AddSeriesForm onSeriesAdded={handleSeriesAdded} />
            {loading ? <p>Đang tải danh sách...</p> : error ? <p style={{ color: 'red' }}>{error}</p> : <SeriesList series={seriesList} onDelete={handleDeleteSeries} onEdit={setEditingSeries} />}
            
            {editingSeries && <EditSeriesForm series={editingSeries} onFinished={handleEditFinished} onCancel={() => setEditingSeries(null)} />}
        </section>
    );
}

export default HandleSeries;
