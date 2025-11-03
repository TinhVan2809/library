import React, { useState } from 'react';
import { useAuth } from './AuthContext';

const SERVER_BASE = 'http://localhost/Library/';

const getFullImageUrl = (path) => {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    return `${SERVER_BASE}${path.replace(/^\/+/, '')}`;
};

function ReviewItem({ review, bookId, onReviewAdded }) {
    const { user } = useAuth();
    const [isReplying, setIsReplying] = useState(false);
    const [replyComment, setReplyComment] = useState('');
    const [replyMessage, setReplyMessage] = useState('');

    // State cho chức năng sửa
    const [isEditing, setIsEditing] = useState(false);
    const [editComment, setEditComment] = useState(review.Comment);
    const [editMessage, setEditMessage] = useState('');

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        setReplyMessage('');

        if (!user) {
            setReplyMessage('Bạn cần đăng nhập để trả lời.');
            return;
        }
        if (!replyComment.trim()) {
            setReplyMessage('Vui lòng nhập nội dung trả lời.');
            return;
        }

        const postData = new FormData();
        postData.append('StudentID', user.StudentID);
        postData.append('BooksID', bookId);
        postData.append('Rating', 5); // Trả lời không cần rating, nhưng DB yêu cầu, có thể sửa DB để cho phép NULL
        postData.append('Comment', replyComment);
        postData.append('ParentReviewID', review.ReviewID);

        try {
            const response = await fetch('http://localhost/Library/Connection/actions/actionForReview.php?action=addReview', {
                method: 'POST',
                body: postData,
            });

            const result = await response.json();
            setReplyMessage(result.message || 'Đã có lỗi xảy ra.');

            if (result.success) {
                setReplyComment('');
                setIsReplying(false);
                if (onReviewAdded) onReviewAdded(); // Gọi lại hàm để tải lại danh sách review
            }
        } catch (err) {
            console.error('Lỗi khi gửi trả lời:', err);
            setReplyMessage('Lỗi kết nối. Không thể gửi trả lời.');
        }
    };

    const handleDelete = async () => {
        if (!user || user.StudentID !== review.StudentID) return;
        if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;

        const postData = new FormData();
        postData.append('ReviewID', review.ReviewID);
        postData.append('StudentID', user.StudentID);

        try {
            const response = await fetch('http://localhost/Library/Connection/actions/actionForReview.php?action=deleteReview', {
                method: 'POST',
                body: postData,
            });
            const result = await response.json();
            if (result.success) {
                if (onReviewAdded) onReviewAdded(); // Tải lại danh sách
            } else {
                alert(result.message || 'Xóa thất bại.');
            }
        } catch (err) {
            console.error('Lỗi khi xóa bình luận:', err);
            alert('Lỗi kết nối. Không thể xóa bình luận.');
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setEditMessage('');

        if (!user || user.StudentID !== review.StudentID) return;
        if (!editComment.trim()) {
            setEditMessage('Nội dung không được để trống.');
            return;
        }

        const postData = new FormData();
        postData.append('ReviewID', review.ReviewID);
        postData.append('StudentID', user.StudentID);
        postData.append('Comment', editComment);

        try {
            const response = await fetch('http://localhost/Library/Connection/actions/actionForReview.php?action=updateReview', {
                method: 'POST',
                body: postData,
            });
            const result = await response.json();
            setEditMessage(result.message);

            if (result.success) {
                setIsEditing(false);
                if (onReviewAdded) onReviewAdded(); // Tải lại để thấy thay đổi
            }
        } catch (err) {
            console.error('Lỗi khi cập nhật bình luận:', err);
            setEditMessage('Lỗi kết nối. Không thể cập nhật.');
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditComment(review.Comment); // Reset lại nội dung
    };

    return (
        <div className="review-item" style={{ marginLeft: review.ParentReviewID ? '2rem' : '0' }}>
            <div className="review-item-header">
                <img src={getFullImageUrl(review.Avata_image) || '/user-icon-icon_1076610-59410-Photoroom.png'} alt={review.FullName} className="reviewer-avatar" />
                <div className="reviewer-info">
                    <strong>{review.FullName}</strong>
                    <span className="review-date">{new Date(review.Created_at).toLocaleDateString('vi-VN')}</span>
                </div>
            </div>
            <div className="review-item-body">
                {isEditing ? (
                    <form onSubmit={handleEditSubmit} className="edit-form">
                        <textarea
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                        ></textarea>
                        <div className="edit-form-actions">
                            <button className='saveChange' type="submit">Lưu</button>
                            <button className='cancelChange' type="button" onClick={handleCancelEdit}>Hủy</button>
                        </div>
                        {editMessage && <p className="review-message">{editMessage}</p>}
                    </form>
                ) : (
                    <>
                        {/* Chỉ hiển thị rating cho bình luận gốc */}
                        {!review.ParentReviewID && (
                            <div className="review-rating">
                                {[...Array(5)].map((_, i) => <span key={i} className={i < review.Rating ? 'active' : ''}>☆</span>)}
                            </div>
                        )}
                        <p className="review-comment">{review.Comment}</p>
                        <div className="review-actions">
                            <button className="btn-reply" onClick={() => setIsReplying(!isReplying)}>
                                {isReplying ? 'Hủy' : 'Trả lời'}
                            </button>
                            {/* Hiển thị nút Sửa/Xóa nếu là chủ sở hữu */}
                            {user && user.StudentID === review.StudentID && (
                                <>
                                    <button className="btn-edit" onClick={() => setIsEditing(true)}>Sửa</button>
                                    <button className="btn-delete" onClick={handleDelete}>Xóa</button>
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>

            {isReplying && !isEditing && (
                <div className="reply-form">
                    <form onSubmit={handleReplySubmit}>
                        <textarea
                            placeholder={`Trả lời ${review.FullName}...`}
                            value={replyComment}
                            onChange={(e) => setReplyComment(e.target.value)}
                        ></textarea>
                        <button type="submit">Gửi</button>
                    </form>
                    {replyMessage && <p className="review-message">{replyMessage}</p>}
                </div>
            )}

            {review.replies && review.replies.length > 0 && (
                <div className="review-replies">
                    {review.replies.map(reply => (
                        <ReviewItem
                            key={reply.ReviewID}
                            review={reply}
                            bookId={bookId}
                            onReviewAdded={onReviewAdded}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default ReviewItem;