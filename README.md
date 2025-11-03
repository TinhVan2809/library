
# Backend - Library Management System 

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
2.  Open your browser and navigate to: `http://localhost/Library/`

## 📖 API Usage

All API requests are handled through action files in the `Connection/actions/` directory. Each file handles a specific group of functions.

**Main Endpoint:** `http://localhost/Library/Connection/actions/{action_file}.php?action={action_name}`


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



