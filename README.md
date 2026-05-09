
# Backend - Library Management System 

Đây là một hệ thống quản lý thư viện đơn giản được xây dựng bằng React và cơ sở dữ liệu MySQL/MariaDB. Dự án cung cấp các chức năng cốt lõi để quản lý sách, học sinh và việc mượn sách trong môi trường thư viện trường học.

## ✨ Key Features

-   **Book Management:** Thêm, sửa, xóa và xem thông tin chi tiết của sách (ISBN, author, publisher, stock quantity).
-   **Student & Admin Management:** Quản lý tài khoản người dùng cho học sinh và quản trị viên.
-   **Book Loan/Return System:**
    -   Học sinh có thể gửi yêu cầu mượn sách.
    -   Quản trị viên có thể duyệt hoặc từ chối yêu cầu.
    -   Theo dõi trạng thái sách: borrowed, returned, overdue.
-   **User Interaction:**
    -   Tìm kiếm và lọc sách theo nhiều tiêu chí.
    -   Thêm sách vào danh sách favorites.
    -   Viết và xem đánh giá sách.
    -   Nhận thông báo về trạng thái mượn sách.
-   **API Backend:** Cung cấp các endpoint có cấu trúc để giao tiếp với cơ sở dữ liệu.

## 🛠️ Tech Stack

-   **Backend:** PHP
-   **Database:** MySQL / MariaDB
-   **Web Server:** Apache (khuyến nghị sử dụng trong môi trường XAMPP)

## 🚀 Setup and Run Instructions

Làm theo các bước sau để cài đặt và chạy dự án trên máy local của bạn.

### 1. Prerequisites

Đảm bảo bạn đã cài đặt môi trường web server local, ví dụ **XAMPP** hoặc **WAMP**.

### 2. Clone the Repository

Clone repository này vào thư mục `htdocs` của XAMPP:
```bash
git clone <YOUR_REPOSITORY_URL> C:/xampp/htdocs/Library
```

### 3. Database Setup

1.  Mở **phpMyAdmin** từ XAMPP control panel.
2.  Tạo một database mới tên là `library`.
3.  Chọn database `library` vừa tạo, sau đó vào tab **Import**.
4.  Chọn file `library.sql` ở thư mục root của dự án và bấm **Import** để import cấu trúc cùng dữ liệu mẫu.

### 4. Connection Configuration

File cấu hình kết nối database nằm tại `Connection/connectDB.php`. Hãy mở file này và đảm bảo các thông tin sau đúng với môi trường của bạn:

-   `$this->db_name = 'library';`
-   `$this->db_user = 'root';`
-   `$this->db_pass = '';` // Password mặc định của XAMPP là rỗng
-   `$this->db_host = 'localhost';`

### 5. Run the Application

1.  Khởi động **Apache** và **MySQL** từ XAMPP control panel.
2.  Mở trình duyệt và truy cập: `http://localhost/library/Library/`

## 📖 API Usage

Tất cả API request được xử lý thông qua các action file trong thư mục `Connection/actions/`. Mỗi file phụ trách một nhóm chức năng cụ thể.

**Main Endpoint:** `http://localhost/library/Library/Connection/actions/{action_file}.php?action={action_name}`


# Frontend - Library Management System (React)

Đây là phần frontend của dự án **Library Management System**, được xây dựng hoàn toàn bằng **React**. Ứng dụng cung cấp giao diện trực quan, hiện đại và thân thiện cho người dùng (học sinh) và quản trị viên tương tác với các tính năng của thư viện, kết nối với backend viết bằng PHP.

## ✨ Key Features

### For Administrators
-   **Book Management (CRUD):**
    -   Giao diện thêm sách mới với đầy đủ thông tin: ISBN, author, publisher, cover image, supplementary images, book series, v.v.
    -   Xem, chỉnh sửa và xóa sách khỏi hệ thống.
    -   Form được pre-populated với các danh sách (authors, categories, publishers) để nhập liệu nhanh hơn.
-   **Account Management:** Giao diện thêm, sửa, xóa tài khoản quản trị viên.
-   **Dynamic Interaction:** Sử dụng alert (SweetAlert2) để xác nhận thao tác và phản hồi tức thì cho người dùng.

### For Users (Students)
-   **Book Discovery:**
    -   Xem thông tin chi tiết sách, bao gồm mô tả, cover image và nhiều supplementary photos.
    -   Xem sách liên quan (cùng category, cùng author, cùng series) dưới dạng slider trực quan.
-   **Book Interaction:**
    -   Gửi yêu cầu mượn sách.
    -   Thêm sách vào danh sách favorites với hiệu ứng real-time và cập nhật like-count.
    -   Viết và gửi review (star ratings và comments).
-   **Modern UI:** Sử dụng `react-slick` cho book slider và `react-router-dom` để điều hướng trang mượt mà.

## 🛠️ Tech Stack

-   **Core Library:** React
-   **Routing:** React Router
-   **Alerts & Pop-ups:** SweetAlert2
-   **Sliders & Carousels:** React Slick
-   **State Management:** React Hooks (useState, useEffect, useContext)

## 🚀 Setup and Run Instructions

Làm theo các bước sau để cài đặt và chạy frontend trên máy local của bạn.

### 1. Prerequisites

-   Đã cài Node.js (version 16.x trở lên) và npm.
-   **PHP Backend** phải được cài đặt và đang chạy (xem `README.md` trong thư mục backend).

### 2. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL> my-library-app
cd my-library-app
```

### 3. Install Dependencies

Mở terminal trong thư mục dự án và chạy:
```bash
npm install
```

### 4. Configure API Endpoints

API endpoint đang được hardcoded trong source (ví dụ: `http://localhost/library/Library/...`). Nếu backend của bạn chạy ở địa chỉ khác, bạn cần tìm và thay thế các URL này trong các component file (ví dụ: `src/AddBookForm.jsx`, `src/Bookdetail.jsx`).

**Recommendation:** Để quản lý tốt hơn, bạn có thể tạo file `src/apiConfig.js` để lưu base URL rồi import vào các component.

### 5. Run the Application

Sau khi cài đặt, chạy command sau để khởi động development server:
```bash
cd user || admin
npm run dev
```

### 6. Run Server (Socket io)
```bash
cd nodejs_express
node server.js
```

![image_alt](/user/public/img.png)

