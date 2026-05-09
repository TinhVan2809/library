import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Khi ứng dụng tải, kiểm tra xem có thông tin người dùng trong localStorage không
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData)); // Lưu thông tin vào localStorage
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user'); // Xóa thông tin khỏi localStorage
    };

       // Hàm mới để cập nhật thông tin người dùng
    const updateUser = (newUserData) => {
        // Sử dụng functional update để đảm bảo state không bị cũ
        setUser(prevUser => {
            const updatedUser = { ...prevUser, ...newUserData };
            // *** ĐÂY LÀ BƯỚC QUAN TRỌNG: Cập nhật lại localStorage ***
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return updatedUser;
        });
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser  }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext); // eslint-disable-line