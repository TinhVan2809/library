## BACKEND ##

# Library Management System 

A simple library management system built with PHP, React, and a MySQL/MariaDB database. This project provides core functionalities to manage books, students, and book loans in a school library environment.

## ✨ Key Features

-   **Book Management:** Add, edit, delete, and view detailed information of books (ISBN, author, publisher, stock quantity).
-   **Student & Admin Management:** Manage user accounts for students and administrators.
-   **Book Loan/Return System:**
    -   Students can submit requests to borrow books.
    -   Administrators can approve or reject requests.
    -   Track book status: borrowed, returned, overdue.
-   **User Interaction:**
    -   Search and filter books by various criteria.
    -   Add books to a favorites list.
    -   Write and view book reviews.
    -   Receive notifications about book loan statuses.
-   **API Backend:** Provides structured endpoints to communicate with the database.

## 🛠️ Tech Stack

-   **Backend:** PHP
-   **Database:** MySQL / MariaDB
-   **Web Server:** Apache (recommended to use within a XAMPP environment)

## 🚀 Setup and Run Instructions

Follow these steps to install and run the project on your local machine.

### 1. Prerequisites

Ensure you have a local web server environment installed, such as **XAMPP** or **WAMP**.

### 2. Clone the Repository

Clone this repository into the `htdocs` directory of XAMPP:
```bash
git clone <YOUR_REPOSITORY_URL> C:/xampp/htdocs/Library
```

### 3. Database Setup

1.  Open **phpMyAdmin** from the XAMPP control panel.
2.  Create a new database named `library`.
3.  Select the newly created `library` database, then go to the **Import** tab.
4.  Choose the `library.sql` file from the project's root directory and click **Import** to import the structure and sample data.

### 4. Connection Configuration

The database connection configuration file is located at `Connection/connectDB.php`. Open this file and ensure the following information is correct for your environment:

-   `$this->db_name = 'library';`
-   `$this->db_user = 'root';`
-   `$this->db_pass = '';` // The default password for XAMPP is empty
-   `$this->db_host = 'localhost';`

### 5. Run the Application

1.  Start **Apache** and **MySQL** from the XAMPP control panel.
2.  Open your browser and navigate to: `http://localhost/library/Library/`

## 📖 API Usage

All API requests are handled through action files in the `Connection/actions/` directory. Each file handles a specific group of functions.

**Main Endpoint:** `http://localhost/library/Library/Connection/actions/{action_file}.php?action={action_name}`

---

### 📚 Book Management

**Endpoint:** `actions/actionForBooks.php`

1.  **Get Book List (pagination, search, filter)**
    -   **Action:** `getBooks`
    -   **Method:** `GET`
    -   **Params:**
        -   `limit` (optional): Number of books per page. Default: 10.
        -   `page` (optional): Current page. Default: 1.
        -   `categoryId` (optional): Filter books by category ID.
        -   `searchTerm` (optional): Search by book title or author name.
        -   `year` (optional): Filter books by publication year.
    -   **URL Example:** `.../actionForBooks.php?action=getBooks&page=1&limit=12&categoryId=3`

2.  **Get Book Details by ID**
    -   **Action:** `getBookById`
    -   **Method:** `GET`
    -   **Params:**
        -   `BooksID` (required): The ID of the book.
    -   **URL Example:** `.../actionForBooks.php?action=getBookById&BooksID=15`

3.  **Add a New Book**
    -   **Action:** `addBooks`
    -   **Method:** `POST`
    -   **Body (form-data):** `ISBN`, `Title`, `AuthorID`, `CategoryID`, `PublisherID`, `StockQuantity`, `ImageUrl` (file upload), `PublisherYears`, `Language`, `Description`, `Status`.

4.  **Update Book Information**
    -   **Action:** `updateBooks`
    -   **Method:** `POST`
    -   **Body (form-data):** `BooksID` (required) and the fields to be updated.

5.  **Delete a Book**
    -   **Action:** `deleteBooks`
    -   **Method:** `POST`
    -   **Body:** `BooksID` (required).

6.  **Get Low Stock Books**
    -   **Action:** `getLowStockBooks`
    -   **Method:** `GET`
    -   **URL Example:** `.../actionForBooks.php?action=getLowStockBooks`

---

### ❤️ Favorites Management

**Endpoint:** `actions/actionForFavorites.php`

1.  **Like / Unlike a Book**
    -   **Action:** `toggleFavorite`
    -   **Method:** `POST`
    -   **Body:**
        -   `student_id` (required): The student's ID.
        -   `book_id` (required): The book's ID.
    -   **Response:** `{ "success": true, "status": "added" }` or `{ "success": true, "status": "removed" }`

2.  **Get Favorited Books by Student**
    -   **Action:** `getFavoritedBooksByStudent`
    -   **Method:** `GET`
    -   **Params:**
        -   `student_id` (required): The student's ID.
    -   **URL Example:** `.../actionForFavorites.php?action=getFavoritedBooksByStudent&student_id=5`

3.  **Get Top Favorited Books**
    -   **Action:** `getTopFavoritedBooks`
    -   **Method:** `GET`
    -   **URL Example:** `.../actionForFavorites.php?action=getTopFavoritedBooks`

---

### 🙋‍♂️ Book Loan Request Management

**Endpoint:** `actions/actionForBookLoanRQ.php`

1.  **Submit a Book Loan Request**
    -   **Action:** `addBookLoanRequest`
    -   **Method:** `POST`
    -   **Body:**
        -   `StudentID` (required): The student's ID.
        -   `BooksID` (required): The book's ID.

2.  **Get All Book Loan Requests (for Admin)**
    -   **Action:** `getAllBookLoanRQ`
    -   **Method:** `GET`

3.  **Update Request Status (for Admin)**
    -   **Action:** `updateRequestStatus`
    -   **Method:** `POST`
    -   **Body:**
        -   `RequestID` (required): The request's ID.
        -   `Status` (required): The new status (`approved`, `rejected`).

4.  **Student Cancels a Book Loan Request**
    -   **Action:** `cancelBookLoanRequest`
    -   **Method:** `POST`
    -   **Body:**
        -   `RequestID` (required): The request's ID.
        -   `StudentID` (required): The student's ID (for verification).

---

*Note: Other endpoints for Admin, Student, Faculty, Major, etc., follow a similar structure. You can find details in the corresponding class files in `Connection/class/`.*

---
---


# Hệ thống Quản lý Thư viện (Library Management System) 

Một hệ thống quản lý thư viện đơn giản được xây dựng bằng PHP và React và cơ sở dữ liệu MySQL/MariaDB. Dự án này cung cấp các chức năng cốt lõi để quản lý sách, sinh viên, và các lượt mượn sách trong một môi trường thư viện học đường.

## ✨ Tính năng chính

-   **Quản lý Sách:** Thêm, sửa, xóa và xem thông tin chi tiết của sách (ISBN, tác giả, nhà xuất bản, số lượng tồn kho).
-   **Quản lý Sinh viên & Admin:** Quản lý thông tin tài khoản cho sinh viên và quản trị viên.
-   **Hệ thống Mượn/Trả sách:**
    -   Sinh viên có thể gửi yêu cầu mượn sách.
    -   Quản trị viên có thể phê duyệt hoặc từ chối các yêu cầu.
    -   Theo dõi trạng thái sách: đã mượn, đã trả, quá hạn.
-   **Tương tác Người dùng:**
    -   Tìm kiếm và lọc sách theo nhiều tiêu chí.
    -   Thêm sách vào danh sách yêu thích (Favorites).
    -   Viết và xem các bài đánh giá (review) cho sách.
    -   Nhận thông báo về trạng thái mượn sách.
-   **API Backend:** Cung cấp các điểm cuối (endpoint) để giao tiếp với cơ sở dữ liệu một cách có cấu trúc.

## 🛠️ Công nghệ sử dụng

-   **Backend:** PHP
-   **Database:** MySQL / MariaDB
-   **Web Server:** Apache (khuyến nghị sử dụng trong môi trường XAMPP)

## 🚀 Hướng dẫn Cài đặt và Chạy dự án

Làm theo các bước sau để cài đặt và chạy dự án trên máy của bạn.

### 1. Yêu cầu

Đảm bảo bạn đã cài đặt một môi trường máy chủ web cục bộ, ví dụ như **XAMPP** hoặc **WAMP**.

### 2. Sao chép mã nguồn

Sao chép (clone) repository này vào thư mục `htdocs` của XAMPP:
```bash
git clone <URL_CUA_REPOSITORY> C:/xampp/htdocs/Library
```

### 3. Cài đặt Cơ sở dữ liệu

1.  Mở **phpMyAdmin** từ bảng điều khiển XAMPP.
2.  Tạo một cơ sở dữ liệu mới với tên là `library`.
3.  Chọn cơ sở dữ liệu `library` vừa tạo, sau đó vào tab **Import**.
4.  Chọn tệp `library.sql` có trong thư mục gốc của dự án và nhấn **Import** để nhập cấu trúc và dữ liệu mẫu.

### 4. Cấu hình Kết nối

Tệp cấu hình kết nối cơ sở dữ liệu nằm tại `Connection/connectDB.php`. Mở tệp này và đảm bảo các thông tin sau là chính xác cho môi trường của bạn:

-   `$this->db_name = 'library';`
-   `$this->db_user = 'root';`
-   `$this->db_pass = '';` // Mật khẩu mặc định của XAMPP là rỗng
-   `$this->db_host = 'localhost';`

### 5. Chạy ứng dụng

1.  Khởi động **Apache** và **MySQL** từ bảng điều khiển XAMPP.
2.  Mở trình duyệt và truy cập vào địa chỉ: `http://localhost/library/Library/`

## 📖 Cách sử dụng API

Tất cả các yêu cầu API được xử lý thông qua các tệp action trong thư mục `Connection/actions/`. Mỗi tệp xử lý một nhóm chức năng cụ thể.

**Endpoint chính:** `http://localhost/library/Library/Connection/actions/{action_file}.php?action={action_name}`

---

### 📚 Quản lý Sách (Books)

**Endpoint:** `actions/actionForBooks.php`

1.  **Lấy danh sách sách (phân trang, tìm kiếm, lọc)**
    -   **Action:** `getBooks`
    -   **Method:** `GET`
    -   **Params:**
        -   `limit` (optional): Số lượng sách mỗi trang. Mặc định: 10.
        -   `page` (optional): Trang hiện tại. Mặc định: 1.
        -   `categoryId` (optional): Lọc sách theo ID thể loại.
        -   `searchTerm` (optional): Tìm kiếm theo tựa đề sách hoặc tên tác giả.
        -   `year` (optional): Lọc sách theo năm xuất bản.
    -   **URL Example:** `.../actionForBooks.php?action=getBooks&page=1&limit=12&categoryId=3`

2.  **Lấy thông tin chi tiết một cuốn sách**
    -   **Action:** `getBookById`
    -   **Method:** `GET`
    -   **Params:**
        -   `BooksID` (required): ID của sách.
    -   **URL Example:** `.../actionForBooks.php?action=getBookById&BooksID=15`

3.  **Thêm sách mới**
    -   **Action:** `addBooks`
    -   **Method:** `POST`
    -   **Body (form-data):** `ISBN`, `Title`, `AuthorID`, `CategoryID`, `PublisherID`, `StockQuantity`, `ImageUrl` (file upload), `PublisherYears`, `Language`, `Description`, `Status`.

4.  **Cập nhật thông tin sách**
    -   **Action:** `updateBooks`
    -   **Method:** `POST`
    -   **Body (form-data):** `BooksID` (required) và các trường cần cập nhật.

5.  **Xóa sách**
    -   **Action:** `deleteBooks`
    -   **Method:** `POST`
    -   **Body:** `BooksID` (required).

6.  **Lấy sách sắp hết hàng**
    -   **Action:** `getLowStockBooks`
    -   **Method:** `GET`
    -   **URL Example:** `.../actionForBooks.php?action=getLowStockBooks`

---

### ❤️ Quản lý Yêu thích (Favorites)

**Endpoint:** `actions/actionForFavorites.php`

1.  **Thích / Bỏ thích một cuốn sách**
    -   **Action:** `toggleFavorite`
    -   **Method:** `POST`
    -   **Body:**
        -   `student_id` (required): ID của sinh viên.
        -   `book_id` (required): ID của sách.
    -   **Response:** `{ "success": true, "status": "added" }` hoặc `{ "success": true, "status": "removed" }`

2.  **Lấy danh sách sách yêu thích của sinh viên**
    -   **Action:** `getFavoritedBooksByStudent`
    -   **Method:** `GET`
    -   **Params:**
        -   `student_id` (required): ID của sinh viên.
    -   **URL Example:** `.../actionForFavorites.php?action=getFavoritedBooksByStudent&student_id=5`

3.  **Lấy top sách được yêu thích nhất**
    -   **Action:** `getTopFavoritedBooks`
    -   **Method:** `GET`
    -   **URL Example:** `.../actionForFavorites.php?action=getTopFavoritedBooks`

---

### 🙋‍♂️ Quản lý Yêu cầu Mượn sách (Book Loan Requests)

**Endpoint:** `actions/actionForBookLoanRQ.php`

1.  **Gửi yêu cầu mượn sách**
    -   **Action:** `addBookLoanRequest`
    -   **Method:** `POST`
    -   **Body:**
        -   `StudentID` (required): ID của sinh viên.
        -   `BooksID` (required): ID của sách.

2.  **Lấy tất cả yêu cầu mượn sách (cho Admin)**
    -   **Action:** `getAllBookLoanRQ`
    -   **Method:** `GET`

3.  **Cập nhật trạng thái yêu cầu (cho Admin)**
    -   **Action:** `updateRequestStatus`
    -   **Method:** `POST`
    -   **Body:**
        -   `RequestID` (required): ID của yêu cầu.
        -   `Status` (required): Trạng thái mới (`approved`, `rejected`).

4.  **Sinh viên hủy yêu cầu mượn sách**
    -   **Action:** `cancelBookLoanRequest`
    -   **Method:** `POST`
    -   **Body:**
        -   `RequestID` (required): ID của yêu cầu.
        -   `StudentID` (required): ID của sinh viên (để xác thực).

---

*Lưu ý: Các endpoint khác dành cho Admin, Sinh viên, Khoa, Chuyên ngành... cũng tuân theo cấu trúc tương tự. Bạn có thể xem chi tiết trong các file class tương ứng tại `Connection/class/`.*

