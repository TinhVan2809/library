import { useState, useEffect } from "react";

function HandlePublishers() {
    const [publisher, setPubliser] = useState([]);
    const [countPublisher, setCountPublisher] = useState(0);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

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
    }, []);

    if(loading) {
        return(
            <>
                <p>Đang tải</p>
            </>
        )
    }

     if(error) {
        return(
            <>
                <p>{error.message}</p>
            </>
        )
    }

    //SỬA NXB

    const handleEditPublisher = () => {
        alert('Tính năng sửa nxb đang phát triển.');
    }

    

    // XÓA NXB
    const handleDeletePublisher = () => {
        alert('updating');
    }



    return (

        <>

        {error && <div className="error-message">{error}</div>}
      <h3>Tổng: {countPublisher} tác giả</h3>

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
                        <td><input type="radio" /></td>
                        <td>{p.PublisherName}</td>
                        <td>{p.Email ? p.Email : 'Không có'}</td>
                        <td>{p.Phone ? p.Phone : 'Không có'}</td>
                        <td>
                            <div className="table-container-btn">
                                <button className="btn-detail">Chi tiết</button>
                                <button className="btn-edit" onClick={handleEditPublisher}>Sửa</button>
                                <button className="btn-delete" onClick={handleDeletePublisher}>Xóa</button>
                            </div>
                        </td>
                    </tr>
                  ))}
                </tbody>
            </table>
        </section>

           
        </>
    );
}

export default HandlePublishers;