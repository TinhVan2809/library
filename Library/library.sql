-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th10 03, 2025 lúc 06:16 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `library`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `admin`
--

CREATE TABLE `admin` (
  `AdminID` int(11) NOT NULL,
  `AdminName` varchar(255) NOT NULL,
  `AdminGmail` varchar(255) NOT NULL,
  `AdminPassword` char(64) NOT NULL,
  `AdminAge` int(11) NOT NULL,
  `AdminGender` char(1) NOT NULL CHECK (`AdminGender` in ('M','F')),
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `UpdatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `admin`
--

INSERT INTO `admin` (`AdminID`, `AdminName`, `AdminGmail`, `AdminPassword`, `AdminAge`, `AdminGender`, `CreatedAt`, `UpdatedAt`) VALUES
(10, 'Tính Văn ', 'tinhvan@gmail.com', '$2y$10$kj4H63lg6e4fp5Jb3BohqOKcXxuJdDOWk9/Qm6MroQe/bf4F.ZgRa', 21, 'M', '2025-09-27 17:15:09', '2025-09-27 17:15:09'),
(13, 'Admin', 'admin@123', '$2y$10$tPvenZga15ffiSfJb3CLquVXrjsA946K5u2oo1LFt8FYXI1H58G1S', 21, 'M', '2025-10-26 12:29:20', '2025-10-26 12:29:20');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `authors`
--

CREATE TABLE `authors` (
  `AuthorID` int(11) NOT NULL,
  `AuthorName` varchar(255) NOT NULL,
  `BirthYear` year(4) DEFAULT NULL,
  `Country` varchar(100) DEFAULT NULL,
  `Description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `authors`
--

INSERT INTO `authors` (`AuthorID`, `AuthorName`, `BirthYear`, `Country`, `Description`) VALUES
(4, 'Nguyễn Đoàn Minh Thư', NULL, NULL, NULL),
(5, 'Robert B. Cialdini', NULL, NULL, NULL),
(6, 'Shannon Thomas', NULL, NULL, NULL),
(7, 'Tina Seelig', NULL, NULL, NULL),
(8, 'Ernie Carwile', NULL, NULL, NULL),
(9, ' Mại Báo Tiểu Lang Quân', NULL, NULL, NULL),
(10, 'Emily', NULL, NULL, NULL),
(11, 'José Mauro de Vasconcelos', NULL, NULL, NULL),
(12, 'Yuval Noah Harari', NULL, NULL, NULL),
(13, 'John Vũ & Nguyên Phong', NULL, NULL, NULL),
(14, 'Paul Kalanithi', NULL, NULL, NULL),
(15, 'John Gray', NULL, NULL, NULL),
(16, 'Paulo Coelho', NULL, NULL, NULL),
(17, 'Ajay Agrawal', NULL, NULL, NULL),
(18, 'Nguyễn Văn Thọ', NULL, NULL, NULL),
(19, 'Dale Carnegie', NULL, NULL, NULL),
(20, 'Alexander Dumas', NULL, NULL, NULL),
(21, 'Sasaki Fumio', NULL, NULL, NULL),
(22, 'Aoyama Gōshō', NULL, NULL, NULL),
(23, 'Gotoge Koyoharu', NULL, NULL, NULL),
(24, ' Aka Akasaka', NULL, NULL, NULL),
(25, 'Daniel Kahneman ', NULL, NULL, NULL),
(26, 'Nguyễn Nhật Ánh', NULL, NULL, NULL),
(27, 'André Aciman', NULL, NULL, NULL),
(28, 'Educate and Empower Kids', NULL, NULL, NULL),
(29, 'Ngã Cật Tây Hồng Thị', NULL, NULL, NULL),
(30, 'Michio Kaku', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `bookloans`
--

CREATE TABLE `bookloans` (
  `BookLoanID` int(11) NOT NULL,
  `StudentID` int(11) NOT NULL,
  `BooksID` int(11) NOT NULL,
  `LoanDate` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'Ngày mượn sách',
  `DueDate` date NOT NULL COMMENT 'Ngày hẹn trả sách',
  `ReturnDate` datetime NOT NULL COMMENT 'Ngày thực tế trả sách',
  `Status` enum('Borrowed','Returned','Overdue') NOT NULL DEFAULT 'Borrowed' COMMENT 'Trạng thái: Đã mượn, Đã trả, Quá hạn'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `bookloans`
--

INSERT INTO `bookloans` (`BookLoanID`, `StudentID`, `BooksID`, `LoanDate`, `DueDate`, `ReturnDate`, `Status`) VALUES
(1, 5, 15, '2025-10-05 01:19:13', '2025-10-04', '0000-00-00 00:00:00', 'Borrowed'),
(4, 5, 18, '2025-10-14 02:19:57', '2025-10-10', '0000-00-00 00:00:00', 'Borrowed'),
(7, 5, 17, '2025-10-13 00:00:00', '2025-10-27', '0000-00-00 00:00:00', 'Borrowed'),
(8, 5, 16, '2025-10-13 00:00:00', '2025-10-27', '0000-00-00 00:00:00', 'Borrowed'),
(12, 5, 31, '2025-10-13 00:00:00', '2025-10-27', '0000-00-00 00:00:00', 'Borrowed'),
(13, 10, 16, '2025-10-13 00:00:00', '2025-10-27', '0000-00-00 00:00:00', 'Borrowed'),
(14, 5, 34, '2025-10-13 00:00:00', '2025-10-27', '0000-00-00 00:00:00', 'Borrowed'),
(15, 5, 18, '2025-10-17 00:00:00', '2025-10-31', '0000-00-00 00:00:00', 'Borrowed'),
(16, 5, 37, '2025-10-17 00:00:00', '2025-10-31', '0000-00-00 00:00:00', 'Borrowed'),
(17, 5, 257, '2025-10-26 00:00:00', '2025-11-09', '0000-00-00 00:00:00', 'Borrowed'),
(18, 10, 238, '2025-10-26 00:00:00', '2025-11-09', '0000-00-00 00:00:00', 'Borrowed'),
(19, 5, 38, '2025-10-26 00:00:00', '2025-11-09', '0000-00-00 00:00:00', 'Borrowed'),
(20, 5, 41, '2025-10-26 00:00:00', '2025-11-09', '0000-00-00 00:00:00', 'Borrowed'),
(21, 5, 264, '2025-10-27 00:00:00', '2025-11-10', '0000-00-00 00:00:00', 'Borrowed'),
(22, 11, 261, '2025-10-30 03:57:33', '2025-10-29', '0000-00-00 00:00:00', 'Borrowed'),
(23, 5, 267, '2025-11-01 00:00:00', '2025-11-15', '0000-00-00 00:00:00', 'Borrowed'),
(24, 5, 242, '2025-11-01 00:00:00', '2025-11-15', '0000-00-00 00:00:00', 'Borrowed');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `bookloan_request`
--

CREATE TABLE `bookloan_request` (
  `RequestID` int(11) NOT NULL,
  `StudentID` int(11) NOT NULL,
  `BooksID` int(11) NOT NULL,
  `Request_date` datetime DEFAULT current_timestamp(),
  `DueDate` DATE NULL DEFAULT NULL, 
  `Status` varchar(255) DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `bookloan_request`
--

INSERT INTO `bookloan_request` (`RequestID`, `StudentID`, `BooksID`, `Request_date`, `Status`) VALUES
(1, 5, 17, '2025-10-13 00:00:00', 'approved'),
(2, 5, 31, '2025-10-13 10:24:20', 'rejected'),
(3, 5, 16, '2025-10-14 02:21:40', 'approved'),
(4, 9, 34, '2025-10-14 02:26:58', 'approved'),
(5, 5, 15, '2025-10-14 02:36:03', 'cancelled'),
(6, 5, 31, '2025-10-14 02:53:00', 'approved'),
(7, 5, 15, '2025-10-14 03:02:35', 'rejected'),
(8, 5, 34, '2025-10-14 03:28:30', 'approved'),
(9, 10, 16, '2025-10-14 03:31:04', 'approved'),
(10, 5, 18, '2025-10-17 21:15:09', 'rejected'),
(11, 5, 18, '2025-10-17 21:23:51', 'approved'),
(12, 5, 37, '2025-10-17 23:01:44', 'approved'),
(13, 5, 41, '2025-10-22 10:58:03', 'approved'),
(14, 5, 38, '2025-10-23 00:40:05', 'approved'),
(15, 10, 238, '2025-10-26 19:05:45', 'approved'),
(16, 5, 257, '2025-10-26 19:16:33', 'approved'),
(17, 5, 229, '2025-10-26 19:25:41', 'rejected'),
(18, 5, 264, '2025-10-28 00:01:12', 'approved'),
(19, 5, 244, '2025-10-30 03:31:47', 'rejected'),
(20, 5, 242, '2025-10-30 03:32:15', 'approved'),
(21, 5, 267, '2025-11-01 06:35:05', 'approved'),
(22, 5, 233, '2025-11-01 06:39:14', 'rejected');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `books`
--

CREATE TABLE `books` (
  `BooksID` int(11) NOT NULL,
  `ISBN` varchar(13) NOT NULL,
  `Title` varchar(255) NOT NULL,
  `AuthorID` int(11) DEFAULT NULL,
  `CategoryID` int(11) DEFAULT NULL,
  `PublisherID` int(11) DEFAULT NULL,
  `PublisherYears` date DEFAULT NULL,
  `Language` varchar(255) DEFAULT NULL,
  `Description` text DEFAULT NULL,
  `ImageUrl` varchar(500) DEFAULT NULL,
  `BookImportDate` datetime DEFAULT NULL,
  `StockQuantity` int(11) DEFAULT NULL,
  `Status` enum('available','unavailable') DEFAULT 'available',
  `book_supplementary_images_ID` int(11) DEFAULT NULL,
  `SeriesID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `books`
--

INSERT INTO `books` (`BooksID`, `ISBN`, `Title`, `AuthorID`, `CategoryID`, `PublisherID`, `PublisherYears`, `Language`, `Description`, `ImageUrl`, `BookImportDate`, `StockQuantity`, `Status`, `book_supplementary_images_ID`, `SeriesID`) VALUES
(15, '978-604-365-6', 'Hành Tinh Của Một Kẻ Nghĩ Nhiều', 4, 3, 3, '2025-10-18', 'Tiếng Việt', '', 'uploads/books/cover_fd10aab20674152c.png', '2025-10-01 00:37:15', 2, 'available', NULL, NULL),
(16, '978-604-59-62', 'Những Đòn Tâm Lý Trong Thuyết Phục', 5, 3, 4, '2025-10-25', 'Tiếng Việt', '', 'uploads/books/cover_2aecbdc3e43635ab.webp', '2025-10-08 22:19:14', 148, 'available', NULL, NULL),
(17, '978-604-330-0', 'Thao Túng Tâm Lý', 6, 3, 5, '2025-10-24', 'Tiếng Việt', '', 'uploads/books/cover_f35300f74c2d45e1.webp', '2025-10-08 22:25:27', 9, 'available', NULL, NULL),
(18, '978-604-1-001', 'Nếu Tôi Biết Được Khi Còn 20', 7, 3, 6, '2025-10-21', 'Tiếng Việt', '', 'uploads/books/cover_83495d77bc83958e.jpg', '2025-10-08 23:30:28', 7, 'available', NULL, NULL),
(31, '978-604-586-5', 'Dám Chấp Nhận', 8, 3, 7, '2025-10-17', 'Tiếng Việt', '', 'uploads/books/cover_504062425f56d242.jpg', '2025-10-09 02:47:02', 11, 'available', NULL, NULL),
(34, '423-123-532-3', 'ĐẠI PHỤNG ĐẢ CANH NHÂN', 9, 5, 4, '2025-10-09', 'Tiếng Việt', '', 'uploads/books/cover_f422d1cbd3783e7c.jpg', '2025-10-10 03:48:14', 7, 'available', NULL, NULL),
(37, '978-604-77-90', 'Sapiens: Lược Sử Loài Người', 12, 3, 6, '2025-10-11', 'Tiếng Việt', '', 'uploads/books/cover_c4366c01a421f0da.webp', '2025-10-17 22:54:19', 29, 'available', NULL, NULL),
(38, '978-604-481-2', 'AI 5.0 - NHANH HƠN, DỄ HƠN, RẺ HƠN, CHÍNH XÁC HƠN', 17, 3, 10, '2024-01-01', 'Tiếng Việt', '', 'uploads/books/cover_c5576bae02d38936.jpg', '2025-10-21 00:31:25', 7, 'available', NULL, NULL),
(40, '978-604-021-5', 'TINH HOA CÁC ĐẠO GIÁO', 18, 3, 5, '2025-10-16', 'Tiếng Việt', '', 'uploads/books/cover_2d5f669fb0b98058.jpg', '2025-10-21 00:40:40', 111, 'available', NULL, NULL),
(41, '978-604-312/9', 'Đắc Nhân Tâm', 19, 3, 9, NULL, 'Tiếng Việt', '', 'uploads/books/cover_b2bf0bd7a2215c24.jpg', '2025-10-21 00:47:41', 4, 'available', NULL, NULL),
(42, '978-604-456-2', 'Bá Tước Môngtơ Crixtô', 20, 4, 9, NULL, 'Tiếng Việt', '', 'uploads/books/cover_3f952c818e264fe5.jpg', '2025-10-21 00:55:35', 7, 'available', NULL, NULL),
(43, '978-604-994-3', 'Lối Sống Tối Giản Của Người Nhật', 21, 3, 4, '2025-10-24', 'Tiếng Việt', '', 'uploads/books/cover_6bbf6ba10bdb746f.jpg', '2025-10-21 01:11:57', 11, 'available', NULL, NULL),
(104, '978-893-10-00', 'Bí Mật Của Người Giàu', 19, 3, 3, '2022-01-15', 'Vietnamese', 'Sách về phát triển cá nhân và quản lý tài chính.', 'uploads/books/cover_cd876c628d2ee3bd.jpg', '2025-10-23 22:41:06', 15, 'available', NULL, NULL),
(116, '53', 'Hành Động: Kẻ Săn Mồi', 20, 2, 7, '2021-01-01', 'Vietnamese', 'Tiểu thuyết hành động kịch tính.', 'uploads/books/cover_545daf39ba7757f1.webp', '2025-10-23 22:57:43', 18, 'available', NULL, NULL),
(117, '34', '7 Thói Quen Của Người Thành Đạt', 16, 3, 3, '2021-03-15', 'Vietnamese', 'Sách phát triển bản thân nổi tiếng toàn cầu.', 'uploads/books/cover_e433dc6010421c00.webp', '2025-10-23 23:02:39', 45, 'available', NULL, NULL),
(118, '33', 'Hành Động: Trận Chiến Cuối Cùng', 17, 2, 6, '2020-09-01', 'Vietnamese', 'Tiểu thuyết hành động chiến đấu.', 'uploads/books/cover_77e2304b1c1fb927.jpg', '2025-10-23 23:02:39', 14, 'available', NULL, NULL),
(119, '32', 'Truyện Tranh: Học Sinh Siêu Năng Lực', 18, 5, 5, '2022-11-19', 'Vietnamese', 'Truyện tranh học đường, siêu nhiên.', 'uploads/books/cover_9b4ac3777cc975df.jpg', '2025-10-23 23:02:39', 28, 'available', NULL, NULL),
(120, '31', 'Khám Phá Bản Thân', 11, 3, 9, '2023-04-05', 'Vietnamese', 'Sách hướng dẫn tự khám phá, phát triển.', 'uploads/books/cover_03859d73497b3fb5.jpg', '2025-10-23 23:02:39', 17, 'available', NULL, NULL),
(121, '30', 'Tiểu Thuyết: Người Đàn Bà Bí Ẩn', 6, 4, 4, '2019-12-10', 'Vietnamese', 'Tiểu thuyết tâm lý, giật gân.', 'uploads/books/cover_514dd0478fa2eb6c.jpg', '2025-10-23 23:02:39', 10, 'available', NULL, NULL),
(122, '29', 'Nghệ Thuật Đàm Phán', 19, 3, 7, '2022-07-01', 'Vietnamese', 'Sách kỹ năng mềm, đàm phán.', 'uploads/books/cover_94ad732f3410d203.webp', '2025-10-23 23:02:39', 23, 'available', NULL, NULL),
(124, '27', 'Truyện Tranh: Công Chúa Xứ Hoa', 21, 5, 10, '2023-01-20', 'Vietnamese', 'Truyện tranh lãng mạn, cổ tích.', 'uploads/books/cover_7f3f7113a8724c75.jpg', '2025-10-23 23:02:39', 39, 'available', NULL, NULL),
(125, '26', 'Tiểu Thuyết: Khúc Ca Của Biển', 7, 4, 3, '2020-11-15', 'Vietnamese', 'Tiểu thuyết phiêu lưu, khám phá biển cả.', 'uploads/books/cover_df2e8c4c000a21b7.jpg', '2025-10-23 23:02:39', 9, 'available', NULL, NULL),
(126, '25', 'Tư Duy Lại', 8, 3, 6, '2022-09-25', 'Vietnamese', 'Sách về sự linh hoạt trong tư duy.', 'uploads/books/cover_d3c53400c18d0b34.jpg', '2025-10-23 23:02:39', 20, 'available', NULL, NULL),
(128, '23', 'Tiểu Thuyết: Đứa Trẻ Mồ Côi', 10, 4, 9, '2023-02-01', 'Vietnamese', 'Tiểu thuyết xã hội, nhân văn.', 'uploads/books/cover_fbd3a1bf24309104.jpg', '2025-10-23 23:02:39', 11, 'available', NULL, NULL),
(129, '22', 'Hành Động: Vùng Đất Chết', 11, 2, 4, '2019-07-22', 'Vietnamese', 'Tiểu thuyết sinh tồn, hậu tận thế.', 'uploads/books/cover_a0e971d1664ffdc9.jpg', '2025-10-23 23:02:39', 13, 'available', NULL, NULL),
(130, '21', 'Sức Mạnh Hiện Tại', 12, 3, 7, '2022-03-05', 'Vietnamese', 'Sách triết học, phát triển tâm linh.', 'uploads/books/cover_01659e7ca8569df6.jpg', '2025-10-23 23:02:39', 30, 'available', NULL, NULL),
(131, '20', 'Tiểu Thuyết: Vườn Địa Đàng', 13, 4, 8, '2020-08-30', 'Vietnamese', 'Tiểu thuyết giả tưởng, hư cấu.', 'uploads/books/cover_279cb4f8ab8dc898.webp', '2025-10-23 23:02:39', 8, 'available', NULL, NULL),
(132, '19', 'Truyện Tranh: Liên Minh Công Lý', 14, 5, 10, '2023-05-10', 'Vietnamese', 'Truyện tranh tập hợp các siêu anh hùng.', 'uploads/books/cover_94da5b04b1b5e1f9.jpg', '2025-10-23 23:02:39', 32, 'available', NULL, NULL),
(133, '18', 'Hành Động: Kẻ Phá Hoại', 15, 2, 3, '2021-10-08', 'Vietnamese', 'Tiểu thuyết hành động gây cấn.', 'uploads/books/cover_da75411436db7607.jpg', '2025-10-23 23:02:39', 15, 'available', NULL, NULL),
(134, '17', 'Nghĩ Giàu Làm Giàu', 16, 3, 6, '2022-11-18', 'Vietnamese', 'Sách kinh điển về thành công và tư duy.', 'uploads/books/cover_db647fccb7909a7a.webp', '2025-10-23 23:02:39', 22, 'available', NULL, NULL),
(135, '16', 'Tiểu Thuyết: Lâu Đài Trong Sương Mù', 17, 4, 5, '2020-03-29', 'Vietnamese', 'Tiểu thuyết huyền bí, lãng mạn.', 'uploads/books/cover_307dba90c6f78509.jpg', '2025-10-23 23:02:39', 7, 'available', NULL, NULL),
(136, '15', 'Truyện Tranh: Samurai Cuối Cùng', 18, 5, 9, '2023-07-07', 'Vietnamese', 'Truyện tranh lịch sử, kiếm hiệp.', 'uploads/books/cover_eaec492f6d92fbf5.jpg', '2025-10-23 23:02:39', 26, 'available', NULL, NULL),
(224, '893-525-141-6', 'Tư Duy Nhanh Và Chậm', 25, 3, 5, '2019-05-12', 'Tiếng Việt', 'Khám phá hai hệ thống tư duy của con người.', 'uploads/books/cover_5b828584c5a523af.jpg', '2025-10-24 00:11:56', 40, 'available', NULL, NULL),
(225, '315', 'Mắt Biếc', 26, 4, 9, '2016-03-20', 'Tiếng Việt', 'Tiểu thuyết lãng mạn nổi tiếng của Nguyễn Nhật Ánh.', 'uploads/books/cover_c70910dd10913308.jpg', '2025-10-24 00:11:56', 100, 'available', NULL, NULL),
(227, '313', 'Nhà Giả Kim', 16, 4, 9, '2015-07-01', 'Tiếng Việt', 'Cuộc hành trình tìm kiếm ước mơ và bản thân.', 'uploads/books/cover_6940a5165b367857.webp', '2025-10-24 00:11:56', 70, 'available', NULL, NULL),
(228, '312', 'Khuyến Học', 18, 3, 4, '2017-02-18', 'Tiếng Việt', 'Khơi gợi tinh thần học tập và cải thiện bản thân.', 'uploads/books/cover_ce2eb9f5cfdb993b.jpg', '2025-10-24 00:11:56', 45, 'available', NULL, NULL),
(229, '311', 'Dám Bị Ghét', 21, 3, 3, '2020-10-01', 'Tiếng Việt', 'Triết lý sống tự do và hạnh phúc.', 'uploads/books/cover_eb522d3d75b87dfa.jpeg', '2025-10-24 00:11:56', 85, 'available', NULL, NULL),
(230, '310', 'Tôi Tự Học', 9, 3, 8, '2014-06-12', 'Tiếng Việt', 'Khơi gợi tinh thần tự học và phát triển cá nhân.', 'uploads/books/cover_f9493e92e30cb622.jpg', '2025-10-24 00:11:56', 50, 'available', NULL, NULL),
(231, '309', 'Bạn Đắt Giá Bao Nhiêu', 10, 3, 6, '2018-08-20', 'Tiếng Việt', 'Sách truyền cảm hứng sống độc lập, tự tin.', 'uploads/books/cover_14062330533a67c2.jpg', '2025-10-24 00:11:56', 55, 'available', NULL, NULL),
(232, '308', 'Tâm Lý Học Tội Phạm', 6, 2, 7, '2020-12-25', 'Tiếng Việt', 'Phân tích hành vi tội phạm qua góc nhìn tâm lý học.', 'uploads/books/cover_75580d4b2cabfc0f.jpg', '2025-10-24 00:11:56', 30, 'available', NULL, NULL),
(233, '289', 'Tôi Là Ai Trong Cuộc Đời Này', 10, 3, 6, '2018-04-12', 'Tiếng Việt', 'Khám phá bản thân và hạnh phúc.', 'uploads/books/cover_78cbe37a10427ac6.webp', '2025-10-24 00:11:56', 65, 'available', NULL, NULL),
(234, '978-604-56-00', 'Khi Hơi Thở Hóa Thinh Không', 14, 4, 9, '2019-07-07', 'Tiếng Việt', 'Hồi ký đầy xúc động của một bác sĩ ung thư.', 'uploads/books/cover_6805cad75c61ddd9.jpg', '2025-10-24 00:11:56', 70, 'available', NULL, NULL),
(237, '284', 'Lược Sử Thời Gian', 8, 2, 5, '2013-11-11', 'Tiếng Việt', 'Khám phá vũ trụ qua góc nhìn Stephen Hawking.', 'uploads/books/cover_a673a58904337ea4.jpg', '2025-10-24 00:11:56', 30, 'available', NULL, NULL),
(238, '283', 'Đời Ngắn Đừng Ngủ Dài', 10, 3, 6, '2019-09-09', 'Tiếng Việt', 'Truyền cảm hứng hành động và sống tích cực.', 'uploads/books/cover_ee4cdedd8989a591.jpg', '2025-10-24 00:11:56', 79, 'available', NULL, NULL),
(239, '282', 'Think Again', 17, 3, 5, '2021-09-09', 'Tiếng Việt', 'Tư duy lại để phát triển bản thân.', 'uploads/books/cover_ad8fef3e22fefbb3.webp', '2025-10-24 00:11:56', 40, 'available', NULL, NULL),
(240, '281', 'Atomic Habits', 15, 3, 4, '2020-10-10', 'Tiếng Việt', 'Xây dựng thói quen tốt, phá bỏ thói quen xấu.', 'uploads/books/cover_c586a02d13f942b8.jpeg', '2025-10-24 00:11:56', 100, 'available', NULL, NULL),
(241, '280', 'The Subtle Art of Not Giving a F*ck', 6, 3, 5, '2021-11-11', 'Tiếng Việt', 'Sống tự do, buông bỏ điều không quan trọng.', 'uploads/books/cover_af1c39dd04004cfd.webp', '2025-10-24 00:11:56', 65, 'available', NULL, NULL),
(242, '279', 'Trò Chơi Của Vị Thần', 8, 5, 3, '2020-12-01', 'Tiếng Việt', 'Truyện tranh giả tưởng hấp dẫn.', 'uploads/books/cover_1c386e08cb7b9ca4.webp', '2025-10-24 00:11:56', 199, 'available', NULL, NULL),
(243, '278', 'Spy x Family - Tập 1', 21, 5, 3, '2022-04-04', 'Tiếng Việt', 'Gia đình điệp viên siêu dễ thương.', 'uploads/books/cover_915f716f3e7d05f5.jpg', '2025-10-24 00:11:56', 220, 'available', NULL, 4),
(244, '277', 'Chainsaw Man - Tập 2', 21, 5, 3, '2021-02-14', 'Tiếng Việt', 'Truyện tranh hành động siêu thực.', 'uploads/books/cover_791614e40b6022dc.webp', '2025-10-24 00:11:56', 180, 'available', NULL, NULL),
(245, '276', 'Blue Lock - Tập 3', 21, 5, 3, '2023-06-06', 'Tiếng Việt', 'Truyện tranh thể thao đầy cảm xúc.', 'uploads/books/cover_3e820a52fa5fd8a5.webp', '2025-10-24 00:11:56', 160, 'available', NULL, 3),
(246, '275', 'Attack on Titan - Tập 4', 21, 5, 3, '2019-07-07', 'Tiếng Việt', 'Trận chiến giữa con người và Titan.', 'uploads/books/cover_ff0ca71154bf3dc3.jpg', '2025-10-24 00:11:56', 140, 'available', NULL, 2),
(247, '274', 'Chuyện Con Mèo Dạy Hải Âu Bay', 11, 4, 4, '2018-09-09', 'Tiếng Việt', 'Truyện ngắn nhẹ nhàng và nhân văn.', 'uploads/books/cover_e79910f66d8fd1f1.webp', '2025-10-24 00:11:56', 75, 'available', NULL, NULL),
(248, '273', 'Không Gia Đình', 20, 4, 10, '2016-12-12', 'Tiếng Việt', 'Tác phẩm cảm động về cậu bé Rémi.', 'uploads/books/cover_1b9e30fbea885bfb.webp', '2025-10-24 00:11:56', 90, 'available', NULL, NULL),
(249, '272', 'Tiếng Gọi Nơi Hoang Dã', 14, 4, 8, '2017-05-05', 'Tiếng Việt', 'Cuộc hành trình sinh tồn của chú chó Buck.', 'uploads/books/cover_94b917b78c2c8b6d.jpg', '2025-10-24 00:11:56', 85, 'available', NULL, NULL),
(254, '267', 'Truyện Kiều', 9, 4, 9, '2013-03-03', 'Tiếng Việt', 'Kiệt tác thơ Nôm của Nguyễn Du.', 'uploads/books/cover_65765f3d6ecad2fc.png', '2025-10-24 00:11:56', 95, 'available', NULL, NULL),
(257, '978-604-123-2', 'Chainsaw Man', 16, 2, 8, '2025-10-24', 'Tiếng Việt', '', 'uploads/books/cover_8c0923c475b7f921.jpg', '2025-10-24 01:35:58', 120, 'available', NULL, 1),
(258, '978-604-243-1', 'Thám tử lừng danh Conan Tập 1 - 20', 22, 5, 4, '2010-01-24', 'Tiếng Việt', '', 'uploads/series/cover_d722edced3acdae5.webp', '2025-10-24 02:42:45', 123, 'available', NULL, 5),
(259, '978-604-698-4', 'Kimetsu no Yaiba', 23, 5, 7, '2025-10-17', 'Tiếng Việt', '', 'uploads/series/cover_1592049cb089936f.webp', '2025-10-24 02:53:54', 20, 'available', NULL, 6),
(261, '978-604-342-6', 'Đứa con của thần tượng', 24, 5, 10, '2025-10-24', 'Tiếng Việt', '', 'uploads/books/cover_6016eefe41db4a88.jpg', '2025-10-24 03:04:41', 121, 'available', NULL, 7),
(262, '978-604-334-3', 'Spy x Family Tập 2', 21, 5, 3, '2025-11-01', 'Tiếng Việt', '', 'uploads/series/cover_3fc3e5b75ce45d67.jpg', '2025-10-25 01:50:01', 122, 'available', NULL, NULL),
(263, '978-604-324-7', 'Gọi Em Bằng Tên Anh', 27, 6, 8, '2025-10-25', 'Tiếng Việt', '', 'uploads/series/cover_25c366bcb78a0633.jpg', '2025-10-26 21:08:37', 23, 'available', NULL, NULL),
(264, '978-604-243-5', 'Nói Con Về Giới Tính', 28, 7, 6, '2025-11-01', 'Tiếng Việt', '', 'uploads/series/cover_0c5a7a99dd1de9b2.webp', '2025-10-26 21:13:05', 10, 'available', NULL, NULL),
(265, '978-604-123-3', 'Tinh Thần Biến', 29, 5, 6, '2025-10-30', 'Tiếng Việt', '', 'uploads/series/cover_cb7b03f0b987f6c8.jpg', '2025-10-30 05:25:48', 20, 'available', NULL, NULL),
(267, '324-234-654-2', 'Các Thế Giới Song Song', 19, 3, 9, '2025-10-30', 'Tiếng Việt', '', 'uploads/series/cover_2b986c6b325b1f07.jpg', '2025-10-30 05:35:28', 54, 'available', NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `book_favorites`
--

CREATE TABLE `book_favorites` (
  `favorite_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `book_favorites`
--

INSERT INTO `book_favorites` (`favorite_id`, `student_id`, `book_id`, `created_at`) VALUES
(2, 5, 261, '2025-10-25 03:47:56'),
(9, 5, 258, '2025-10-25 03:51:51'),
(12, 5, 257, '2025-10-25 03:52:35'),
(18, 5, 241, '2025-10-25 03:56:54'),
(23, 5, 224, '2025-10-25 04:10:38'),
(33, 5, 230, '2025-10-25 04:14:11'),
(43, 5, 225, '2025-10-25 04:15:17'),
(46, 5, 227, '2025-10-25 04:15:28'),
(49, 5, 247, '2025-10-25 04:15:32'),
(52, 5, 120, '2025-10-25 04:16:36'),
(56, 5, 229, '2025-10-25 04:17:04'),
(59, 5, 117, '2025-10-25 04:28:39'),
(60, 5, 231, '2025-10-25 04:29:13'),
(62, 5, 262, '2025-10-25 04:31:09'),
(63, 10, 261, '2025-10-25 05:19:51'),
(64, 10, 262, '2025-10-25 05:20:13'),
(65, 10, 257, '2025-10-25 05:25:54'),
(66, 10, 117, '2025-10-25 05:30:52'),
(67, 10, 228, '2025-10-25 05:36:32'),
(68, 10, 241, '2025-10-25 05:42:35'),
(69, 5, 233, '2025-10-26 06:45:08'),
(70, 5, 122, '2025-10-26 10:04:09'),
(71, 10, 34, '2025-10-26 18:59:23'),
(72, 10, 232, '2025-10-26 19:01:15'),
(73, 5, 16, '2025-10-26 19:09:41'),
(74, 5, 234, '2025-10-26 20:25:02'),
(75, 5, 124, '2025-10-26 20:25:12'),
(76, 5, 239, '2025-10-26 20:53:42'),
(77, 5, 264, '2025-10-28 00:01:06'),
(78, 5, 246, '2025-10-28 02:53:06'),
(79, 5, 18, '2025-10-28 08:20:05'),
(80, 5, 259, '2025-10-28 08:35:24'),
(81, 5, 228, '2025-10-29 04:47:46'),
(82, 5, 237, '2025-10-29 04:47:58'),
(83, 5, 119, '2025-10-29 05:21:52'),
(84, 5, 232, '2025-10-30 20:58:48'),
(85, 5, 34, '2025-11-01 02:57:50'),
(86, 5, 135, '2025-11-01 06:46:59'),
(87, 5, 129, '2025-11-01 06:47:36'),
(88, 5, 41, '2025-11-01 10:15:12'),
(89, 5, 15, '2025-11-02 15:46:14'),
(90, 10, 42, '2025-11-02 18:34:09'),
(91, 5, 263, '2025-11-03 05:06:16'),
(92, 5, 37, '2025-11-03 06:30:42');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `book_review`
--

CREATE TABLE `book_review` (
  `ReviewID` int(11) NOT NULL,
  `StudentID` int(11) NOT NULL,
  `BooksID` int(11) NOT NULL,
  `Rating` tinyint(3) UNSIGNED NOT NULL,
  `Comment` text DEFAULT NULL,
  `Created_at` datetime DEFAULT current_timestamp(),
  `ParentReviewID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `book_review`
--

INSERT INTO `book_review` (`ReviewID`, `StudentID`, `BooksID`, `Rating`, `Comment`, `Created_at`, `ParentReviewID`) VALUES
(2, 5, 41, 5, 'sách hay', '2025-10-22 08:46:02', NULL),
(3, 10, 17, 5, 'Mọi người nên đọc một lần.', '2025-10-22 08:52:53', NULL),
(4, 10, 42, 5, 'Cũng hay, ý nghĩa.', '2025-10-22 09:01:02', NULL),
(5, 5, 42, 5, '10 điểm.', '2025-10-22 09:05:20', NULL),
(8, 5, 17, 5, 'ok', '2025-10-22 09:32:42', NULL),
(9, 11, 17, 5, 'Good', '2025-10-22 11:26:06', NULL),
(10, 5, 16, 5, 'Sách hay nha...', '2025-10-26 19:09:56', NULL),
(12, 5, 227, 5, 'Cũng ổn.', '2025-10-28 02:42:17', NULL),
(13, 5, 246, 5, 'Hay nha.❤️❤️', '2025-10-28 02:53:27', NULL),
(14, 5, 261, 5, 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque odit, eos magnam, reprehenderit accusantium sed totam at voluptatum modi assumenda, ut ea accusamus possimus provident adipisci quidem dolor illo necessitatibus!', '2025-10-30 20:56:11', NULL),
(17, 5, 38, 5, 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque odit, eos magnam, reprehenderit accusantium sed totam at voluptatum modi assumenda, ut ea accusamus possimus provident adipisci quidem dolor illo necessitatibus!', '2025-11-02 17:49:29', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `book_series`
--

CREATE TABLE `book_series` (
  `SeriesID` int(11) NOT NULL,
  `SeriesName` varchar(255) NOT NULL,
  `Image_background` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `book_series`
--

INSERT INTO `book_series` (`SeriesID`, `SeriesName`, `Image_background`) VALUES
(1, 'Chainsaw Man', 'uploads/series/series_bg_cc8e5dbe43a293fb.jpg'),
(2, 'Attack on Titan', 'uploads/series/series_bg_9def3cbd7cd217bb.jpg'),
(3, 'Blue Block', 'uploads/series/series_bg_0159d7b6486a511c.jpg'),
(4, 'Spy x Family', 'uploads/series/series_bg_e54ac93d59799d0a.webp'),
(5, 'Thám tử lừng danh Conan', 'uploads/series/series_bg_b968350cae3a6f4c.jpg'),
(6, 'Kimetsu no Yaiba', 'uploads/series/series_bg_1e6285e9b3d689fe.webp'),
(7, 'Đứa con của thần tượng', 'uploads/series/series_bg_20fed8f13c6ea79f.jpg');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `book_supplementary_images`
--

CREATE TABLE `book_supplementary_images` (
  `book_supplementary_images_ID` int(11) NOT NULL,
  `BooksID` int(11) DEFAULT NULL,
  `image_url_sp` varchar(255) DEFAULT NULL,
  `IsPrimary` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `book_supplementary_images`
--

INSERT INTO `book_supplementary_images` (`book_supplementary_images_ID`, `BooksID`, `image_url_sp`, `IsPrimary`) VALUES
(4, 37, 'uploads/books/sp_0357ed25b3e167a8.jpg', 0),
(5, 37, 'uploads/books/sp_d259215a77eac497.webp', 0),
(6, 38, 'uploads/books/sp_f8b0edd986d84a52.webp', 0),
(7, 38, 'uploads/books/sp_237e72eaef0a0e2a.png', 0),
(8, 43, 'uploads/books/sp_57669e24e61c508a.jpg', 0),
(9, 121, 'uploads/books/sp_99a0f93cc0455224.jpg', 0),
(10, 121, 'uploads/books/sp_169afbbf66b00a4f.jpg', 0),
(11, 130, 'uploads/books/sp_cc08420cee968797.jpg', 0),
(12, 258, 'uploads/series/sp_c5275ce07e4f9f5a.webp', 0),
(13, 259, 'uploads/series/sp_a36a6d289b3fe994.webp', 0),
(14, 261, 'uploads/books/sp_2d41db09c63347bc.jpg', 0);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `categories`
--

CREATE TABLE `categories` (
  `CategoryID` int(11) NOT NULL,
  `CategoryName` varchar(255) NOT NULL,
  `Description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `categories`
--

INSERT INTO `categories` (`CategoryID`, `CategoryName`, `Description`) VALUES
(2, 'Hành Động', NULL),
(3, 'Đời Sống', NULL),
(4, 'Tiểu thuyết', NULL),
(5, 'Truyện tranh', NULL),
(6, 'Romance', NULL),
(7, 'Giáo dục', NULL),
(8, 'Công Nghệ', NULL),
(9, 'Tôn Giáo', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `faculty`
--

CREATE TABLE `faculty` (
  `FacultyID` int(11) NOT NULL,
  `FacultyCode` varchar(20) NOT NULL,
  `FacultyName` varchar(255) NOT NULL,
  `Phone` varchar(20) DEFAULT NULL,
  `Email` varchar(255) DEFAULT NULL,
  `Address` varchar(255) DEFAULT NULL,
  `EstablishedYear` year(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `faculty`
--

INSERT INTO `faculty` (`FacultyID`, `FacultyCode`, `FacultyName`, `Phone`, `Email`, `Address`, `EstablishedYear`) VALUES
(1, 'KTCN2025', 'Kỹ thuật công nghệ', '', 'qlkhoa@gmail.com', '', '2010'),
(3, 'ANTT2025', 'An Toàn Thông Tin', '', 'qlkhoa@gmail.com', '', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `major`
--

CREATE TABLE `major` (
  `MajorID` int(11) NOT NULL,
  `MajorCode` varchar(20) NOT NULL,
  `MajorName` varchar(255) NOT NULL,
  `FacultyID` int(11) NOT NULL,
  `TrainingLevel` varchar(50) DEFAULT NULL,
  `CreditsRequired` int(11) DEFAULT NULL,
  `Description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `major`
--

INSERT INTO `major` (`MajorID`, `MajorCode`, `MajorName`, `FacultyID`, `TrainingLevel`, `CreditsRequired`, `Description`) VALUES
(2, 'CNTT2025', 'Công Nghệ Thông Tin', 1, 'Kỹ sư', NULL, '');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `my_list_books`
--

CREATE TABLE `my_list_books` (
  `ListID` int(11) NOT NULL,
  `BooksID` int(11) NOT NULL,
  `StudentID` int(11) NOT NULL,
  `Add_date` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `my_list_books`
--

INSERT INTO `my_list_books` (`ListID`, `BooksID`, `StudentID`, `Add_date`) VALUES
(2, 31, 9, '2025-10-14 03:25:38'),
(3, 17, 10, '2025-10-14 03:32:36'),
(11, 230, 10, '2025-10-26 19:07:08');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `notifications`
--

CREATE TABLE `notifications` (
  `NotificationID` int(11) NOT NULL,
  `StudentID` int(11) NOT NULL,
  `Message` text NOT NULL,
  `Link` varchar(255) DEFAULT NULL,
  `IsRead` tinyint(1) NOT NULL DEFAULT 0,
  `CreatedAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `notifications`
--

INSERT INTO `notifications` (`NotificationID`, `StudentID`, `Message`, `Link`, `IsRead`, `CreatedAt`) VALUES
(1, 5, 'Yêu cầu mượn sách \'Dám Chấp Nhận\' của bạn đã được duyệt.', '/my-borrows', 1, '2025-10-13 20:01:32'),
(2, 5, 'Yêu cầu mượn sách \'Hành Tinh Của Một Kẻ Nghĩ Nhiều\' của bạn đã bị từ chối.', '/my-borrows', 1, '2025-10-13 20:05:40'),
(3, 10, 'Yêu cầu mượn sách \'Những Đòn Tâm Lỹ Trong Thuyết Phục\' của bạn đã được duyệt.', '/my-borrows', 1, '2025-10-13 20:31:23'),
(4, 5, 'Yêu cầu mượn sách \'ĐẠI PHỤNG ĐẢ CANH NHÂN\' của bạn đã được duyệt.', '/my-borrows', 1, '2025-10-13 20:45:58'),
(5, 5, 'Yêu cầu mượn sách \'Nếu Tôi Biết Được Khi Còn 20\' của bạn đã bị từ chối.', '/my-borrows', 1, '2025-10-17 14:15:29'),
(6, 5, 'Yêu cầu mượn sách \'Nếu Tôi Biết Được Khi Còn 20\' của bạn đã được duyệt.', '/my-borrows', 1, '2025-10-17 14:24:04'),
(7, 5, 'Yêu cầu mượn sách \'Sapiens: Lược Sử Loài Người\' của bạn đã được duyệt.', '/my-borrows', 1, '2025-10-17 16:01:59'),
(8, 5, 'Yêu cầu mượn sách \'Dám Bị Ghét\' của bạn đã bị từ chối.', '/my-borrows', 1, '2025-10-26 12:27:18'),
(9, 5, 'Yêu cầu mượn sách \'Chainsaw Man\' của bạn đã được duyệt.', '/my-borrows', 1, '2025-10-26 13:55:32'),
(10, 10, 'Yêu cầu mượn sách \'Đời Ngắn Đừng Ngủ Dài\' của bạn đã được duyệt.', '/my-borrows', 1, '2025-10-26 13:55:35'),
(11, 5, 'Yêu cầu mượn sách \'AI 5.0 - NHANH HƠN, DỄ HƠN, RẺ HƠN, CHÍNH XÁC HƠN\' của bạn đã được duyệt.', '/my-borrows', 1, '2025-10-26 13:55:39'),
(12, 5, 'Yêu cầu mượn sách \'Đắc Nhân Tâm\' của bạn đã được duyệt.', '/my-borrows', 1, '2025-10-26 13:55:41'),
(13, 5, 'Yêu cầu mượn sách \'Nói Con Về Giới Tính\' của bạn đã được duyệt.', '/my-borrows', 1, '2025-10-27 17:01:45'),
(14, 5, 'Yêu cầu mượn sách \'Chainsaw Man - Tập 2\' của bạn đã bị từ chối.', '/my-borrows', 1, '2025-10-29 20:31:59'),
(15, 5, 'Yêu cầu mượn sách \'Các Thế Giới Song Song\' của bạn đã được duyệt.', '/my-borrows', 1, '2025-10-31 23:35:30'),
(16, 5, 'Yêu cầu mượn sách \'Trò Chơi Của Vị Thần\' của bạn đã được duyệt.', '/my-borrows', 1, '2025-10-31 23:36:56'),
(17, 5, 'Yêu cầu mượn sách \'Tôi Là Ai Trong Cuộc Đời Này\' của bạn đã bị từ chối.', '/my-borrows', 1, '2025-10-31 23:39:21');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `publishers`
--

CREATE TABLE `publishers` (
  `PublisherID` int(11) NOT NULL,
  `PublisherName` varchar(255) NOT NULL,
  `Address` varchar(255) DEFAULT NULL,
  `Phone` varchar(20) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `Website` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `publishers`
--

INSERT INTO `publishers` (`PublisherID`, `PublisherName`, `Address`, `Phone`, `Email`, `Website`) VALUES
(3, 'NXB Kim Đồng', NULL, NULL, NULL, NULL),
(4, 'NXB Lao Động', NULL, NULL, NULL, NULL),
(5, 'NSX Dân Trí', NULL, NULL, NULL, NULL),
(6, 'NXB Trẻ', NULL, NULL, NULL, NULL),
(7, 'NXB Tổng Hợp TPHCM', NULL, NULL, NULL, NULL),
(8, 'NSX Hồng Đức', NULL, NULL, NULL, NULL),
(9, 'NXB Văn Học', NULL, NULL, NULL, NULL),
(10, 'NXB Công Thương', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `student`
--

CREATE TABLE `student` (
  `StudentID` int(11) NOT NULL,
  `StudentCode` varchar(20) NOT NULL,
  `FullName` varchar(255) NOT NULL,
  `Gender` char(1) DEFAULT NULL CHECK (`Gender` in ('M','F')),
  `DateOfBirth` date NOT NULL,
  `Email` varchar(255) DEFAULT NULL,
  `Password` varchar(255) NOT NULL,
  `Phone` varchar(20) DEFAULT NULL,
  `Address` varchar(255) DEFAULT NULL,
  `EnrollmentYear` year(4) DEFAULT NULL,
  `MajorID` int(11) NOT NULL,
  `FacultyID` int(11) NOT NULL,
  `Status` varchar(255) DEFAULT NULL,
  `Avata_image` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `student`
--

INSERT INTO `student` (`StudentID`, `StudentCode`, `FullName`, `Gender`, `DateOfBirth`, `Email`, `Password`, `Phone`, `Address`, `EnrollmentYear`, `MajorID`, `FacultyID`, `Status`, `Avata_image`) VALUES
(5, '227060125', 'Lữ Văn Tính', 'M', '2004-09-28', 'lvtinh-cntt17@tdu.edu.vn', '$2y$10$bDKbC4X9YqKOIrwe4v2aaOYepee.54204qHLMA12YOADmP1dTr72e', '0818177533', '', '0000', 2, 1, '', 'uploads/avatars/avatar_5_1762126952.jpg'),
(9, '227060145', 'Lữ Tính Văn ', 'M', '2004-06-22', 'ltvan-cntt17@tdu.edu.vn', '$2y$10$xQ5kclRKSuDsLAMJI4T2nOAtWol6EdpNkUR6o5H8nJwvjwY6n6HsS', '0813502953', NULL, NULL, 2, 1, NULL, NULL),
(10, '227060117', 'Lê Du', 'M', '2025-10-10', 'ledu@tdu.edu.vn', '$2y$10$Fdu3q5qpY5WBDiZgPfOpIeB8cMzt2nYIXwd/HW0/txWW0ot/fCTg2', NULL, NULL, NULL, 2, 1, NULL, NULL),
(11, '227060555', 'Hasagawa', 'M', '2025-10-24', 'hase@gmail.com', '$2y$10$ei9Y3JNDmJhvVAAkNe6T3e4sQ8.1Ga2YkWdJzTEQpb1/qTdROH0Nq', NULL, NULL, NULL, 2, 3, NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `userid` int(10) UNSIGNED NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `last_login` datetime DEFAULT NULL,
  `avata` varchar(255) DEFAULT NULL,
  `status` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`userid`, `username`, `email`, `password`, `created_at`, `updated_at`, `last_login`, `avata`, `status`) VALUES
(1, ' Lữ Tính Văn', 'tinhlu703@gmail.com', 'tinhlu28092004', '2025-10-26 13:42:28', NULL, NULL, NULL, 1);

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`AdminID`);

--
-- Chỉ mục cho bảng `authors`
--
ALTER TABLE `authors`
  ADD PRIMARY KEY (`AuthorID`);

--
-- Chỉ mục cho bảng `bookloans`
--
ALTER TABLE `bookloans`
  ADD PRIMARY KEY (`BookLoanID`),
  ADD KEY `idx_student_id` (`StudentID`),
  ADD KEY `idx_books_id` (`BooksID`);

--
-- Chỉ mục cho bảng `bookloan_request`
--
ALTER TABLE `bookloan_request`
  ADD PRIMARY KEY (`RequestID`),
  ADD KEY `FK_Student_Request` (`StudentID`),
  ADD KEY `FK_Book_Request` (`BooksID`);

--
-- Chỉ mục cho bảng `books`
--
ALTER TABLE `books`
  ADD PRIMARY KEY (`BooksID`),
  ADD UNIQUE KEY `ISBN` (`ISBN`),
  ADD KEY `AuthorID` (`AuthorID`),
  ADD KEY `CategoryID` (`CategoryID`),
  ADD KEY `PublisherID` (`PublisherID`),
  ADD KEY `fk_books_supplementary_images` (`book_supplementary_images_ID`),
  ADD KEY `SeriesID` (`SeriesID`);

--
-- Chỉ mục cho bảng `book_favorites`
--
ALTER TABLE `book_favorites`
  ADD PRIMARY KEY (`favorite_id`),
  ADD UNIQUE KEY `uk_student_book` (`student_id`,`book_id`),
  ADD KEY `book_id` (`book_id`);

--
-- Chỉ mục cho bảng `book_review`
--
ALTER TABLE `book_review`
  ADD PRIMARY KEY (`ReviewID`),
  ADD KEY `FK_Student_Review` (`StudentID`),
  ADD KEY `FK_Book_Review` (`BooksID`),
  ADD KEY `fk_parent_review` (`ParentReviewID`);

--
-- Chỉ mục cho bảng `book_series`
--
ALTER TABLE `book_series`
  ADD PRIMARY KEY (`SeriesID`);

--
-- Chỉ mục cho bảng `book_supplementary_images`
--
ALTER TABLE `book_supplementary_images`
  ADD PRIMARY KEY (`book_supplementary_images_ID`),
  ADD KEY `BooksID` (`BooksID`);

--
-- Chỉ mục cho bảng `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`CategoryID`),
  ADD UNIQUE KEY `CategoryName` (`CategoryName`);

--
-- Chỉ mục cho bảng `faculty`
--
ALTER TABLE `faculty`
  ADD PRIMARY KEY (`FacultyID`),
  ADD UNIQUE KEY `FacultyCode` (`FacultyCode`);

--
-- Chỉ mục cho bảng `major`
--
ALTER TABLE `major`
  ADD PRIMARY KEY (`MajorID`),
  ADD UNIQUE KEY `MajorCode` (`MajorCode`),
  ADD KEY `fk_major_faculty` (`FacultyID`);

--
-- Chỉ mục cho bảng `my_list_books`
--
ALTER TABLE `my_list_books`
  ADD PRIMARY KEY (`ListID`),
  ADD KEY `BooksID` (`BooksID`),
  ADD KEY `StudentID` (`StudentID`);

--
-- Chỉ mục cho bảng `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`NotificationID`),
  ADD KEY `StudentID` (`StudentID`);

--
-- Chỉ mục cho bảng `publishers`
--
ALTER TABLE `publishers`
  ADD PRIMARY KEY (`PublisherID`),
  ADD UNIQUE KEY `PublisherName` (`PublisherName`);

--
-- Chỉ mục cho bảng `student`
--
ALTER TABLE `student`
  ADD PRIMARY KEY (`StudentID`),
  ADD UNIQUE KEY `StudentCode` (`StudentCode`),
  ADD KEY `fk_student_major` (`MajorID`),
  ADD KEY `FK_FacultyID` (`FacultyID`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userid`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `email_2` (`email`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `admin`
--
ALTER TABLE `admin`
  MODIFY `AdminID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT cho bảng `authors`
--
ALTER TABLE `authors`
  MODIFY `AuthorID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT cho bảng `bookloans`
--
ALTER TABLE `bookloans`
  MODIFY `BookLoanID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT cho bảng `bookloan_request`
--
ALTER TABLE `bookloan_request`
  MODIFY `RequestID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT cho bảng `books`
--
ALTER TABLE `books`
  MODIFY `BooksID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=268;

--
-- AUTO_INCREMENT cho bảng `book_favorites`
--
ALTER TABLE `book_favorites`
  MODIFY `favorite_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=93;

--
-- AUTO_INCREMENT cho bảng `book_review`
--
ALTER TABLE `book_review`
  MODIFY `ReviewID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT cho bảng `book_series`
--
ALTER TABLE `book_series`
  MODIFY `SeriesID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `book_supplementary_images`
--
ALTER TABLE `book_supplementary_images`
  MODIFY `book_supplementary_images_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT cho bảng `categories`
--
ALTER TABLE `categories`
  MODIFY `CategoryID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT cho bảng `faculty`
--
ALTER TABLE `faculty`
  MODIFY `FacultyID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `major`
--
ALTER TABLE `major`
  MODIFY `MajorID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `my_list_books`
--
ALTER TABLE `my_list_books`
  MODIFY `ListID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT cho bảng `notifications`
--
ALTER TABLE `notifications`
  MODIFY `NotificationID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT cho bảng `publishers`
--
ALTER TABLE `publishers`
  MODIFY `PublisherID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `student`
--
ALTER TABLE `student`
  MODIFY `StudentID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `userid` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `bookloans`
--
ALTER TABLE `bookloans`
  ADD CONSTRAINT `fk_bookloans_books` FOREIGN KEY (`BooksID`) REFERENCES `books` (`BooksID`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_bookloans_student` FOREIGN KEY (`StudentID`) REFERENCES `student` (`StudentID`) ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `bookloan_request`
--
ALTER TABLE `bookloan_request`
  ADD CONSTRAINT `FK_Book_Request` FOREIGN KEY (`BooksID`) REFERENCES `books` (`BooksID`),
  ADD CONSTRAINT `FK_Student_Request` FOREIGN KEY (`StudentID`) REFERENCES `student` (`StudentID`);

--
-- Các ràng buộc cho bảng `books`
--
ALTER TABLE `books`
  ADD CONSTRAINT `books_ibfk_1` FOREIGN KEY (`AuthorID`) REFERENCES `authors` (`AuthorID`),
  ADD CONSTRAINT `books_ibfk_2` FOREIGN KEY (`CategoryID`) REFERENCES `categories` (`CategoryID`),
  ADD CONSTRAINT `books_ibfk_3` FOREIGN KEY (`PublisherID`) REFERENCES `publishers` (`PublisherID`),
  ADD CONSTRAINT `books_ibfk_4` FOREIGN KEY (`SeriesID`) REFERENCES `book_series` (`SeriesID`),
  ADD CONSTRAINT `fk_books_supplementary_images` FOREIGN KEY (`book_supplementary_images_ID`) REFERENCES `book_supplementary_images` (`book_supplementary_images_ID`);

--
-- Các ràng buộc cho bảng `book_favorites`
--
ALTER TABLE `book_favorites`
  ADD CONSTRAINT `book_favorites_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`StudentID`) ON DELETE CASCADE,
  ADD CONSTRAINT `book_favorites_ibfk_2` FOREIGN KEY (`book_id`) REFERENCES `books` (`BooksID`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `book_review`
--
ALTER TABLE `book_review`
  ADD CONSTRAINT `FK_Book_Review` FOREIGN KEY (`BooksID`) REFERENCES `books` (`BooksID`),
  ADD CONSTRAINT `FK_Student_Review` FOREIGN KEY (`StudentID`) REFERENCES `student` (`StudentID`),
  ADD CONSTRAINT `fk_parent_review` FOREIGN KEY (`ParentReviewID`) REFERENCES `book_review` (`ReviewID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `book_supplementary_images`
--
ALTER TABLE `book_supplementary_images`
  ADD CONSTRAINT `book_supplementary_images_ibfk_1` FOREIGN KEY (`BooksID`) REFERENCES `books` (`BooksID`);

--
-- Các ràng buộc cho bảng `major`
--
ALTER TABLE `major`
  ADD CONSTRAINT `fk_major_faculty` FOREIGN KEY (`FacultyID`) REFERENCES `faculty` (`FacultyID`) ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `my_list_books`
--
ALTER TABLE `my_list_books`
  ADD CONSTRAINT `my_list_books_ibfk_1` FOREIGN KEY (`BooksID`) REFERENCES `books` (`BooksID`),
  ADD CONSTRAINT `my_list_books_ibfk_2` FOREIGN KEY (`StudentID`) REFERENCES `student` (`StudentID`);

--
-- Các ràng buộc cho bảng `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`StudentID`) REFERENCES `student` (`StudentID`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `student`
--
ALTER TABLE `student`
  ADD CONSTRAINT `FK_FacultyID` FOREIGN KEY (`FacultyID`) REFERENCES `faculty` (`FacultyID`),
  ADD CONSTRAINT `fk_student_major` FOREIGN KEY (`MajorID`) REFERENCES `major` (`MajorID`),
  ADD CONSTRAINT `student_ibfk_1` FOREIGN KEY (`FacultyID`) REFERENCES `faculty` (`FacultyID`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
