import React, { useEffect, useState } from 'react';


const AuthorManager = () => {
  const [author, setAuthor] = useState([]);
  const [countAuthor, setCountAuthor] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
 
  useEffect(() => {

    const fetchAuthorsData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [authorRes, countAuthorRes] = await Promise.all([
          fetch("http://localhost/Library/Connection/actions/actionForAuthors.php?action=GetAuthors"),
          fetch('http://localhost/Library/Connection/actions/actionForAuthors.php?action=getCountAuthors'),
        ]);

        if(!authorRes.ok) throw new Error(`Lỗi khi tải authors: ${authorRes.status}`);
        if(!countAuthorRes.ok) throw new Error(`Lỗi khi tải authors: ${countAuthorRes.status}`);
      

        const result = await authorRes.json();
        const resultCount = await countAuthorRes.json();
        
        if(result.success && Array.isArray(result.data)) {
          setAuthor(result.data);
        } else {
          throw new Error(result.message || "Không thể tải dữ liệu tác giả.");
        }

        // CHANGED: extract numeric count flexibly from possible response shapes
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
          setCountAuthor(total);
        } else {
          throw new Error(resultCount.message || "Không thể tải tổng số tác giả.");
        }

       

      } catch(err) {
        console.error("Lỗi khi tải dữ liệu tác giả: ", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthorsData();
    

  }, []);


  return (
    <>
       {error && <div className="error-message">{error}</div>}
      <h3>Tổng: {countAuthor} tác giả</h3>

      <section>
        <table className='table-container'>
        <thead>
          <tr>
            <th><input type="radio" /></th>
            <th>Tên tác giả</th>
            <th>Birth Year</th>
            <th>Country</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {author.map((auth) => (
            <tr key={auth.AuthorID}>
              <td><input type="radio" /></td>
              <td>{auth.AuthorName}</td>
              <td>{auth.BirthYear ? auth.BirthYear : 'không'}</td>
              <td>{auth.Country ? auth.Country : 'Không'}</td>
              <td>
                <div className="table-container-btn">
                  <button>Mô tả</button>
                  <button className='btn-edit'>Sửa</button>
                  <button className='btn-delete'>Xóa</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </section>
      
    </>
  );
};

export default AuthorManager;