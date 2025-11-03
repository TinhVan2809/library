import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";


function HandleNotification() {
    const {user} = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {

         if (!user || !user.StudentID) {
            setLoading(false);
            // setError("Bạn cần đăng nhập để xem thông tin cá nhân.");
            return;
        }
        
        const fetchNotificationData = async () => {

            setError(null);
            setLoading(true);
        try{

               const [notificationRes] = await Promise.all([
                    fetch(`http://localhost/Library/Connection/actions/actionForNotifications.php?action=getNotificationsByStudent&StudentID=${user.StudentID}`),
                   
                ]);

                if(!notificationRes.ok) throw new Error(`Lỗi khi lấy số lượng thông báo: ${notificationRes.status}`);

                const result = await notificationRes.json();

                 if (result.success && result.data) {
                    setNotifications(result.data);
                } else {
                    throw new Error(result.message || 'Không thể tải dữ liệu thông báo.');
                }

        } 
        catch(err) {
            console.error("Lỗi khi tải dữ liệu thông báo: ", err);
            setError(err.message); // 6. Sửa lại cách set lỗi
        } finally{
            setLoading(false);
        }

        };

        fetchNotificationData();
    }, [user]);


    if (loading) {
        return <p>Đang tải thông báo...</p>;
    }

    if (error) {
        return <p>Lỗi: {error}</p>;
    }

    return (

        <>
            <div className="notification-page-container">
                <h1>Tất cả thông báo</h1>
                {notifications.length > 0 ? (
                    <div className="notification-list">
                        {notifications.map(n => (
                            <div key={n.NotificationID} className={`notification-item ${n.IsRead ? 'read' : 'unread'}`}>
                                <p className="notification-message">{n.Message}</p>
                                <span className="notification-date">{new Date(n.CreatedAt).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>Bạn không có thông báo nào.</p>
                )}
            </div>
        </>
    );
}

export default HandleNotification;