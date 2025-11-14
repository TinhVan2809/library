import { useState, useEffect } from 'react';

const SERVER_BASE = 'http://localhost/Library/';
const GLOBAL_DEFAULT_PLACEHOLDER = '/placeholder.png'; // Ảnh mặc định toàn cục

// Hàm xử lý URL, có thể được sử dụng nội bộ hoặc export ra ngoài nếu cần
const getFullImageUrl = (path, fallback) => {
  if (!path) return fallback;
  
  let pathStr = String(path).trim();
  
  // Nếu đã là URL đầy đủ hoặc là blob URL (dùng cho preview), trả về ngay
  if (/^https?:\/\//i.test(pathStr) || pathStr.startsWith('blob:')) {
    return pathStr;

  }
  
  // *** FIX: Chỉ sửa các đường dẫn cũ bị sai của sách, không ảnh hưởng đến series ***
  // Nếu đường dẫn bắt đầu bằng 'uploads/' nhưng không phải 'uploads/series/',
  // và cũng không phải 'uploads/books/', thì mới chèn 'books/' vào.
  if (pathStr.startsWith('uploads/') && !pathStr.startsWith('uploads/series/') && !pathStr.startsWith('uploads/books/')) {
    pathStr = pathStr.replace('uploads/', 'uploads/books/');
  }

  // Xây dựng URL tuyệt đối từ đường dẫn tương đối
  const base = SERVER_BASE.replace(/\/+$/, '');
  const relativePath = pathStr.replace(/\\/g, '/').replace(/^\//, ''); 
  return `${base}/${relativePath}`;
};

/**
 * Component Image tái sử dụng để tự động xử lý URL và ảnh placeholder.
 * @param {object} props - Props cho component, bao gồm `src`, `alt`, và các props khác của thẻ `<img>`.
 */
function Image({ src, alt, fallback = GLOBAL_DEFAULT_PLACEHOLDER, ...props }) {
  // Ưu tiên ảnh fallback được truyền vào, nếu không có thì dùng ảnh mặc định toàn cục
  const finalFallback = fallback;
  const [imgSrc, setImgSrc] = useState(getFullImageUrl(src, finalFallback));

  // Cập nhật lại imgSrc khi prop `src` thay đổi
  useEffect(() => {
    setImgSrc(getFullImageUrl(src, finalFallback));
  }, [src, finalFallback]);

  // Xử lý khi ảnh bị lỗi không tải được
  const handleError = () => {
    // Chỉ set lại placeholder nếu ảnh hiện tại không phải là placeholder
    if (imgSrc !== finalFallback) {
      console.warn(`Image load failed: ${imgSrc}. Falling back to placeholder.`);
      setImgSrc(finalFallback);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={handleError}
      {...props} // Truyền các props còn lại như className, title, style...
    />
  );
}

export default Image;
