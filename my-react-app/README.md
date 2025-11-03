
# Frontend - Library Management System (React)

This is the frontend part of the **Library Management System** project, built entirely with **React**. This application provides an intuitive, modern, and user-friendly interface for users (students) and administrators to interact with the library's features, connecting to a PHP-built backend.

## ✨ Key Features

### For Administrators
-   **Book Management (CRUD):**
    -   An interface to add new books with complete information: ISBN, author, publisher, cover image, supplementary images, book series, etc.
    -   View, edit, and delete books from the system.
    -   Forms are pre-populated with lists (authors, categories, publishers) for quick data entry.
-   **Account Management:** An interface to add, edit, and delete administrator accounts.
-   **Dynamic Interaction:** Uses alerts (SweetAlert2) to confirm actions and provide immediate user feedback.

### For Users (Students)
-   **Book Discovery:**
    -   View detailed book information, including descriptions, cover images, and multiple supplementary photos.
    -   View related books (same category, same author, same series) in an intuitive slider format.
-   **Book Interaction:**
    -   Submit book loan requests.
    -   Add books to a favorites list with real-time effects and like-count updates.
    -   Write and submit reviews (star ratings and comments).
-   **Modern UI:** Utilizes `react-slick` for book sliders and `react-router-dom` for smooth page navigation.

## 🛠️ Tech Stack

-   **Core Library:** React
-   **Routing:** React Router
-   **Alerts & Pop-ups:** SweetAlert2
-   **Sliders & Carousels:** React Slick
-   **State Management:** React Hooks (useState, useEffect, useContext)

## 🚀 Setup and Run Instructions

Follow these steps to set up and run the frontend on your local machine.

### 1. Prerequisites

-   Node.js (version 16.x or later) and npm installed.
-   The **PHP Backend** must be installed and running (see the `README.md` in the backend directory).

### 2. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL> my-library-app
cd my-library-app
```

### 3. Install Dependencies

Open a terminal in the project directory and run:
```bash
npm install
```

### 4. Configure API Endpoints

API endpoints are hardcoded in the source (e.g., `http://localhost/Library/...`). If your backend is running on a different address, you will need to find and replace these URLs in the component files (e.g., `src/AddBookForm.jsx`, `src/Bookdetail.jsx`).

**Recommendation:** For better management, consider creating a `src/apiConfig.js` file to store the base URL and import it into your components.

### 5. Run the Application

After installation, run the following command to start the development server:
```bash
npm start
```

The application will automatically open in your browser at `http://localhost:3000`.


---

# Giao diện Người dùng - Hệ thống Quản lý Thư viện (React)

Đây là phần giao diện người dùng (Frontend) của dự án **Hệ thống Quản lý Thư viện**, được xây dựng hoàn toàn bằng **React**. Ứng dụng này cung cấp một giao diện trực quan, hiện đại và thân thiện để người dùng (sinh viên) và quản trị viên tương tác với các chức năng của thư viện, kết nối với backend được xây dựng bằng PHP.

## ✨ Tính năng chính

### Dành cho Quản trị viên (Admin)
-   **Quản lý Sách (CRUD):**
    -   Giao diện thêm sách mới với đầy đủ thông tin: ISBN, tác giả, NXB, ảnh bìa, ảnh phụ, bộ sách...
    -   Xem danh sách, sửa thông tin và xóa sách khỏi hệ thống.
    -   Form được tích hợp sẵn các danh sách (tác giả, thể loại, NXB) để nhập liệu nhanh chóng.
-   **Quản lý Tài khoản:** Giao diện để thêm, sửa, xóa tài khoản quản trị viên.
-   **Tương tác động:** Sử dụng thông báo (SweetAlert2) để xác nhận hành động và cung cấp phản hồi tức thì cho người dùng.

### Dành cho Người dùng (Sinh viên)
-   **Khám phá Sách:**
    -   Xem chi tiết thông tin sách, bao gồm mô tả, ảnh bìa, và nhiều ảnh phụ.
    -   Xem các sách liên quan (cùng thể loại, cùng tác giả, cùng bộ sách) dưới dạng slider trực quan.
-   **Tương tác với Sách:**
    -   Gửi yêu cầu mượn sách.
    -   Thêm sách vào danh sách yêu thích (Favorites) với hiệu ứng và cập nhật số lượt thích theo thời gian thực.
    -   Viết và gửi đánh giá (rating sao và bình luận).
-   **Giao diện người dùng hiện đại:** Sử dụng `react-slick` cho các slider sách, `react-router-dom` để điều hướng trang mượt mà.

## 🛠️ Công nghệ sử dụng

-   **Thư viện chính:** React
-   **Điều hướng:** React Router
-   **Thông báo & Pop-up:** SweetAlert2
-   **Slider & Carousel:** React Slick
-   **Quản lý trạng thái:** React Hooks (useState, useEffect, useContext)

## 🚀 Hướng dẫn Cài đặt và Chạy dự án

Làm theo các bước sau để cài đặt và chạy giao diện trên máy của bạn.

### 1. Yêu cầu

-   Đã cài đặt Node.js (phiên bản 16.x trở lên) và npm.
-   **Backend PHP** đã được cài đặt và đang chạy (xem file `README.md` của thư mục backend).

### 2. Sao chép mã nguồn

Sao chép (clone) repository này vào máy của bạn:
```bash
git clone <URL_CUA_REPOSITORY> my-library-app
cd my-library-app
```

### 3. Cài đặt các gói phụ thuộc

Mở terminal trong thư mục dự án và chạy lệnh sau:
```bash
npm install
```

### 4. Cấu hình API Endpoint

Các địa chỉ API được gọi trong code (ví dụ: `http://localhost/Library/...`). Nếu backend của bạn chạy ở một địa chỉ khác, bạn cần tìm và thay thế các URL này trong các file component (ví dụ: `src/AddBookForm.jsx`, `src/Bookdetail.jsx`).

**Gợi ý:** Để quản lý tốt hơn, bạn có thể tạo một file `src/apiConfig.js` để lưu trữ URL gốc và import vào các component.

### 5. Chạy ứng dụng

Sau khi cài đặt xong, chạy lệnh sau để khởi động server phát triển:
```bash
npm start
```

Ứng dụng sẽ tự động mở trong trình duyệt của bạn tại địa chỉ `http://localhost:3000`.

