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


