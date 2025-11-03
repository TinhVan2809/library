import { useState, useEffect } from "react";

function HandlePublishers() {
    const [publisher, setPubliser] = useState([]);
    const [countPublisher, setCountPublisher] = useState(0);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchPublisherData = async () => {

            try{
                const [publisherRes] = await Promise.all([
                    fetch('http://localhost/Library/Connection/actions/actionForPublishers.php?action=GetPublishers'),
                ]); 

                if(!publisherRes.ok) throw new Error(`Lỗi HTTP: ${publisherRes.status}`);

                const result = await publisherRes.json();

                if(result.success && result.data) {
                    setPubliser(result.data);
                } else {
                    throw new Error(result.message || "Không thể tải dữ liệu nhà xuất bản");
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


    return (

        <>

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
                                <button className="btn-edit">Sửa</button>
                                <button className="btn-delete">Xóa</button>
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