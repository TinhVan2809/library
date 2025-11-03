import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const BookcaseContext = createContext(null);

const getFullImageUrl = (path) => {
    const SERVER_BASE = 'http://localhost/Library/';
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    return `${SERVER_BASE}${path.replace(/^\/+/, '')}`;
};

export const BookcaseProvider = ({ children }) => {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchBookcase = useCallback(async () => { 
        if (!user) return;
        setLoading(true);
        try {
            const response = await fetch(`http://localhost/Library/Connection/actions/actionForMyList.php?action=getListByStudent&StudentID=${user.StudentID}`);
            const result = await response.json();
            if (result.success) {
                const normalizedData = result.data.map(item => ({
                    ...item, 
                    ImageUrl: getFullImageUrl(item.ImageUrl)
                }));
                setItems(normalizedData);
            }
        } catch (error) {
            console.error("Failed to fetch bookcase items:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchBookcase();
    }, [fetchBookcase]);

    const addToList = async (book) => {
        // Thêm sách vào state ngay lập tức để cập nhật UI
        const newItem = { ...book, ImageUrl: getFullImageUrl(book.ImageUrl), ListID: `temp-${Date.now()}` };
        setItems(prev => [newItem, ...prev]);
        // Sau đó gọi API để đồng bộ với server
        // (Logic gọi API đã có trong BookDetail.jsx, có thể chuyển vào đây)
        // Sau khi API thành công, gọi lại fetchBookcase() để lấy ListID chính xác
        await fetchBookcase(); 
    };

    const deleteFromList = async (listId) => {
        if (!window.confirm('Bạn có chắc muốn xóa sách này khỏi tủ?')) {
            return;
        }
        // Optimistic UI: Xóa khỏi state ngay lập tức
        const originalItems = items;
        setItems(prev => prev.filter(item => item.ListID !== listId));

        // Gọi API để xóa trên server
        const postData = new FormData();
        postData.append('ListID', listId);
        try {
            const response = await fetch('http://localhost/Library/Connection/actions/actionForMyList.php?action=deleteFromList', {
                method: 'POST',
                body: postData,
            });
            const result = await response.json();
            if (!result.success) {
                alert(result.message);
                setItems(originalItems); // Hoàn tác nếu có lỗi
            }
        } catch (error) {
            console.error("Lỗi khi xóa sách khỏi tủ:", error);
            alert('Đã có lỗi xảy ra. Vui lòng thử lại.');
            setItems(originalItems); // Hoàn tác nếu có lỗi
        }
    };

    const value = {
        items,
        loading,
        fetchBookcase,
        addToList,
        deleteFromList,
    };

    return (
        <BookcaseContext.Provider value={value}>
            {children}
        </BookcaseContext.Provider>
    );
};

export const useBookcase  = () => { 
    const context = useContext(BookcaseContext);
    if (!context) throw new Error('useBookcase must be used within a BookcaseProvider');
    return context;
};