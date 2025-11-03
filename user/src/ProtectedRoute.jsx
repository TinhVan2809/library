import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

function ProtectedRoute({ children }) {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        // Nếu người dùng chưa đăng nhập, chuyển hướng họ đến trang login
        // `state={{ from: location }}` để lưu lại trang họ đang muốn truy cập
        // Sau khi đăng nhập thành công, chúng ta có thể chuyển họ về lại trang này
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children; // Nếu đã đăng nhập, hiển thị component con (trang được yêu cầu)
}

export default ProtectedRoute;