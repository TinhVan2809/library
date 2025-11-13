import { useState, useEffect} from "react";

function HandleDashbroad() {
  const [chat, setChat] = useState([]);

    const [stats, setStats] = useState({
        books: 0,
        series: 0,
        authors: 0,
        publishers: 0,
        loanRequests: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); 

    // Helper function to fetch a single stat
    const fetchStat = async (url) => {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} for ${url}`);
        }
        const result = await response.json();
        if (result.success) {
            // The count is the first value in the first object, e.g., { "COUNT(BooksID)": "123" }
            // Or it could be a direct value from the API. We'll handle both.
            if (typeof result.data === 'object' && result.data !== null && !Array.isArray(result.data)) {
                 return Object.values(result.data)[0] || 0;
            }
            return result.data || 0;
        }
        throw new Error(result.message || `Failed to fetch stat from ${url}`);
    };

    useEffect(() => {
        const fetchCount = async () => {
          try {
            // Tách riêng việc fetch chat và fetch các chỉ số thống kê
            const statsPromise = Promise.all([
                fetchStat('http://localhost/Library/Connection/actions/actionForBooks.php?action=getCountBooks'),
                fetchStat('http://localhost/Library/Connection/actions/actionForBooks.php?action=getCountSeries'),
                fetchStat('http://localhost/Library/Connection/actions/actionForAuthors.php?action=getCountAuthors'),
                fetchStat('http://localhost/Library/Connection/actions/actionForPublishers.php?action=getCountPublishers'),
                fetchStat('http://localhost/Library/Connection/actions/actionForBookLoanRQ.php?action=getCountRequests'),
            ]);

            const chatPromise = fetch('http://localhost:3001/api/chat/messages');

            const [[books, series, authors, publishers, loanRequests], chatRes] = await Promise.all([statsPromise, chatPromise]);

            setStats({ books, series, authors, publishers, loanRequests });

            const chatData = await chatRes.json();
            // Kiểm tra xem chatData có phải là object và có chứa mảng 'data' không
            if (chatData && chatData.success && Array.isArray(chatData.data)) {
              setChat(chatData.data);
            } else if (Array.isArray(chatData)) { // Hoặc nếu API trả về trực tiếp một mảng
              setChat(chatData);
            }
            // Nếu không, chat sẽ giữ giá trị mảng rỗng ban đầu, tránh gây lỗi

          } catch (error) {
            setError(error.message);
            console.error('Lỗi khi tải dữ liệu dashboard:', error);
          } finally {
            setLoading(false);
          }
        };
    
        fetchCount();
      }, []); 
    
      if (loading) return <p>Đang tải dữ liệu dashboard...</p>; 
      if (error) return <p style={{ color: 'red' }}>Lỗi: {error}</p>;

    return (
      <>
      
        <section className="dashboard-container">
            <div className="stats-grid">

                <div className="stat-card">                      
                  <p>Tổng số sách</p>
                  <span>{stats.books}</span>
                </div>

                <div className="stat-card">               
                  <p>Tổng số bộ sách</p>
                  <span>{stats.series}</span>                  
                </div>

                <div className="stat-card">                                
                  <p>Tổng số tác giả</p>
                   <span>{stats.authors}</span>                 
                </div>

                <div className="stat-card">                   
                  <p>Tổng số NXB</p>
                  <span>{stats.publishers}</span>                  
                </div>

            </div>
        </section>
      

      {/* <div className="chat">
        {chat.map((chat) => (
          <p>{chat.FullName}</p>
        ))}
      </div> */}
      
        </>
    );
}

export default HandleDashbroad; 