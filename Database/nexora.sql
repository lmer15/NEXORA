-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 15, 2025 at 08:37 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `nexora`
--

-- --------------------------------------------------------

--
-- Table structure for table `email_confirmations`
--

CREATE TABLE `email_confirmations` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(64) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NOT NULL DEFAULT (current_timestamp() + interval 5 minute)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `facilities`
--

CREATE TABLE `facilities` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(12) NOT NULL,
  `owner_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `facilities`
--

INSERT INTO `facilities` (`id`, `name`, `code`, `owner_id`, `created_at`, `updated_at`) VALUES
(27, 'Calista Herman\'s Facility', 'KJ9KEG5K', 40, '2025-04-25 03:00:23', '2025-04-25 03:00:23'),
(28, 'McKenzie Reilly\'s Facility', '297KWOKN', 41, '2025-04-25 03:24:14', '2025-04-26 04:04:13'),
(29, 'Rafael Guy\'s Facility', '9H4U06U3', 42, '2025-04-25 06:48:31', '2025-04-27 18:57:19'),
(30, 'Rosalyn Harmon\'s Facility', 'JEWD8OI7', 43, '2025-04-25 09:34:49', '2025-04-27 02:11:10'),
(31, 'Mechelle Rutledge\'s Facility', '91ZKCDMO', 44, '2025-04-25 09:37:42', '2025-04-29 07:46:47'),
(32, 'Rhoda Christensen\'s Facility', 'BR1IVN5U', 45, '2025-04-26 11:04:13', '2025-04-26 11:04:13'),
(33, 'Ross Erickson\'s Facility', '6SRW58SJ', 46, '2025-05-06 14:48:19', '2025-05-06 14:48:19'),
(34, 'Benjamin Petersen\'s Facility', 'XNKB8CKC', 47, '2025-05-20 12:25:02', '2025-05-20 12:25:02'),
(35, 'Riley Melton\'s Facility', '99VIIG4X', 48, '2025-05-20 12:27:55', '2025-05-20 12:27:55'),
(36, 'Belle Nieves\'s Facility', '087GNRMN', 49, '2025-08-15 14:43:12', '2025-08-15 14:43:12');

-- --------------------------------------------------------

--
-- Table structure for table `facility_admins`
--

CREATE TABLE `facility_admins` (
  `id` int(11) NOT NULL,
  `facility_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `assigned_by` int(11) NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `facility_admins`
--

INSERT INTO `facility_admins` (`id`, `facility_id`, `user_id`, `assigned_by`, `assigned_at`) VALUES
(13, 27, 40, 40, '2025-04-25 03:00:23'),
(14, 28, 41, 41, '2025-04-25 03:24:14'),
(15, 29, 42, 42, '2025-04-25 06:48:31'),
(16, 30, 43, 43, '2025-04-25 09:34:49'),
(17, 31, 44, 44, '2025-04-25 09:37:42'),
(21, 32, 45, 45, '2025-04-26 11:04:13'),
(51, 33, 46, 46, '2025-05-06 14:48:19'),
(52, 29, 41, 42, '2025-05-20 10:54:07'),
(54, 34, 47, 47, '2025-05-20 12:25:02'),
(55, 35, 48, 48, '2025-05-20 12:27:55'),
(56, 35, 41, 48, '2025-05-20 12:41:30'),
(57, 36, 49, 49, '2025-08-15 14:43:12');

-- --------------------------------------------------------

--
-- Table structure for table `facility_invitations`
--

CREATE TABLE `facility_invitations` (
  `id` int(11) NOT NULL,
  `facility_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `code` varchar(12) NOT NULL,
  `status` enum('pending','accepted','expired') NOT NULL DEFAULT 'pending',
  `invited_by` int(11) NOT NULL,
  `invited_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NOT NULL DEFAULT (current_timestamp() + interval 7 day)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `facility_members`
--

CREATE TABLE `facility_members` (
  `id` int(11) NOT NULL,
  `facility_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `facility_members`
--

INSERT INTO `facility_members` (`id`, `facility_id`, `user_id`, `joined_at`) VALUES
(13, 27, 40, '2025-04-25 03:00:23'),
(14, 28, 41, '2025-04-25 03:24:14'),
(15, 29, 42, '2025-04-25 06:48:31'),
(16, 30, 43, '2025-04-25 09:34:49'),
(17, 31, 44, '2025-04-25 09:37:42'),
(19, 28, 40, '2025-04-26 04:03:29'),
(20, 28, 42, '2025-04-26 04:03:29'),
(28, 32, 45, '2025-04-26 11:04:13'),
(30, 32, 41, '2025-04-26 11:05:13'),
(35, 27, 41, '2025-04-29 00:18:12'),
(37, 31, 41, '2025-04-29 14:06:12'),
(38, 30, 44, '2025-04-29 14:06:55'),
(42, 32, 43, '2025-05-06 04:22:29'),
(43, 33, 46, '2025-05-06 14:48:19'),
(44, 33, 42, '2025-05-06 14:49:10'),
(46, 33, 41, '2025-05-10 00:31:58'),
(47, 29, 41, '2025-05-16 10:05:06'),
(49, 29, 40, '2025-05-16 10:05:49'),
(50, 29, 44, '2025-05-16 10:07:14'),
(51, 29, 43, '2025-05-16 10:08:58'),
(52, 29, 45, '2025-05-20 06:05:31'),
(53, 28, 44, '2025-05-20 11:08:05'),
(54, 28, 45, '2025-05-20 11:10:55'),
(55, 34, 47, '2025-05-20 12:25:02'),
(56, 35, 48, '2025-05-20 12:27:55'),
(57, 35, 41, '2025-05-20 12:40:59'),
(58, 35, 42, '2025-05-20 12:41:15'),
(59, 36, 49, '2025-08-15 14:43:12');

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `priority` enum('high','medium','low') NOT NULL,
  `due_date` date NOT NULL,
  `color` varchar(7) NOT NULL,
  `status` enum('todo','progress','done') DEFAULT 'todo',
  `owner_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_archived` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `name`, `description`, `priority`, `due_date`, `color`, `status`, `owner_id`, `created_at`, `is_archived`) VALUES
(176, 'Hope Oconnor', 'Pariatur Ducimus d', 'low', '2025-05-10', '#167f6a', 'todo', 44, '2025-04-27 19:06:12', 0),
(177, 'TaShya Holder', 'mamamamamamamammmamamamaAt aut quo soluta prkrjgjntolggjmntgpoyjhptdojmyhtfhnrfjtgnrio frgnrfgjntjgpt dfgldnfgfgbbfgtfg', 'medium', '2025-05-24', '#b9ecad', 'todo', 44, '2025-04-27 19:06:21', 0),
(178, 'Brynn Haynes', 'Dolore autem magni b', 'low', '2025-05-10', '#380ab2', 'done', 44, '2025-04-27 19:06:27', 0),
(180, 'Nadine Cabreras', 'Eos ex cupiditate lo                        ', 'medium', '2025-05-15', '#c02a49', 'progress', 44, '2025-04-27 19:06:43', 0),
(181, 'Veronica Knapp', 'Adipisci id ea quia', 'low', '2025-05-05', '#de9eb2', 'done', 44, '2025-04-27 19:06:50', 0),
(182, 'Whilemina Cotes', 'Corporis harum neces baby', 'high', '0000-00-00', '#a9d91b', 'todo', 45, '2025-04-27 19:07:44', 0),
(183, 'Leigh Bridges', 'Enim est perspiciat', 'medium', '2025-05-05', '#056e5d', 'progress', 45, '2025-04-27 19:07:50', 0),
(184, 'Omar Myers', 'Sit cupiditate labor', 'low', '2025-05-05', '#29a41a', 'done', 45, '2025-04-27 19:07:57', 0),
(185, 'Isaac Boyer', 'In aute neque occaec', 'medium', '2025-05-05', '#880d81', 'done', 45, '2025-04-27 19:08:03', 0),
(186, 'Hollee Rosales', 'Duis in nulla provid', 'high', '2025-05-05', '#b1fceb', 'todo', 45, '2025-04-27 19:08:09', 0),
(187, 'Clayton Schneider', 'Accusantium velit es', 'high', '2025-05-05', '#6248fa', 'progress', 45, '2025-04-27 19:08:13', 0),
(189, 'September Leblanc', 'Sunt autem est quia', 'medium', '2025-05-05', '#95d68e', 'progress', 43, '2025-04-27 19:09:02', 0),
(191, 'Kirsten Barrs', 'Aut cupiditate dolor', 'low', '0000-00-00', '#323ba3', 'todo', 43, '2025-04-27 19:09:14', 0),
(192, 'Callum Sanders', 'Labore ipsum dolorem', 'high', '2025-05-05', '#613f14', 'progress', 43, '2025-04-27 19:09:22', 0),
(194, 'Cheryl Cummings', 'Architecto et doloru', 'low', '2025-05-30', '#357b96', 'progress', 42, '2025-04-27 19:09:52', 0),
(197, 'Lilah Meadowss', 'Quis qui illo sit inssss', 'low', '0000-00-00', '#4bdfdc', 'done', 42, '2025-04-27 19:10:07', 0),
(198, 'Eveniet, autem invens.', 'ELMER RAPONNN            ', 'low', '2025-05-30', '#e0f78a', 'progress', 42, '2025-04-27 19:10:11', 0),
(199, 'Gisela Kirklands', 'Sint impedit sunt m', 'high', '2025-05-31', '#4455e2', 'done', 42, '2025-04-27 19:10:15', 0),
(200, 'Todd Kidd', 'Sit dolorem consequ', 'medium', '2025-05-20', '#2d2a35', 'progress', 41, '2025-04-27 19:10:44', 0),
(202, 'TaShya Holden', 'Nihil esse officiis', 'high', '2025-05-05', '#690e09', 'progress', 41, '2025-04-27 19:10:51', 0),
(203, 'Regina Stuart', 'Sed ex eveniet do a', 'low', '0000-00-00', '#97b280', 'progress', 41, '2025-04-27 19:10:55', 0),
(204, 'Leilani Christensen', 'Quo id dolores modi', 'high', '2025-05-21', '#b10c88', 'done', 41, '2025-04-27 19:11:10', 0),
(205, 'Chester Owens', 'Eligendi dicta conse', 'high', '2025-05-05', '#94c5a1', 'done', 41, '2025-04-27 19:11:18', 0),
(206, 'Ferdinand Harvey', 'Dolor aut non pariat', 'high', '2025-05-29', '#6bd5c1', 'progress', 40, '2025-04-27 19:11:37', 0),
(207, 'Hedda Bush', 'Facilis sed qui aut', 'high', '2025-05-05', '#1c1cc6', 'todo', 40, '2025-04-27 19:11:40', 0),
(208, 'Kibo Wilkinson', 'Voluptatem in quam q', 'high', '2025-05-05', '#bb7108', 'done', 40, '2025-04-27 19:11:46', 0),
(209, 'Kuame Lyons', 'Quis quaerat dolor s', 'high', '2025-05-05', '#ea5868', 'todo', 40, '2025-04-27 19:11:52', 0),
(210, 'Rana Randolph', 'Tempor omnis adipisc', 'medium', '2025-05-05', '#5d19c6', 'progress', 40, '2025-04-27 19:11:55', 0),
(211, 'Vernon Holt', 'Error soluta ipsa l', 'high', '2025-05-05', '#cec5f7', 'done', 40, '2025-04-27 19:12:02', 0),
(212, 'Halee Bernard', 'In qui occaecat mole', 'high', '2025-05-15', '#560025', 'done', 43, '2025-04-27 19:40:01', 0),
(213, 'Xenos Frank', 'Aperiam et doloremqu', 'low', '2025-05-13', '#2abc51', 'done', 43, '2025-04-27 19:40:28', 0),
(214, 'Jonah Ewing', 'In molestiae praesen', 'medium', '2025-05-05', '#a025e0', 'done', 43, '2025-04-27 19:40:34', 0),
(215, 'Grady Washington', 'Modi cumque quos NamS', 'low', '2025-05-05', '#0e3e51', 'progress', 44, '2025-04-27 22:41:52', 0),
(216, 'Judah Malone', 'Vel magni irure ea s', 'medium', '2025-05-23', '#bd8a51', 'todo', 45, '2025-04-29 04:12:56', 1),
(220, 'Paul Miles', 'Aute praesentium aut', 'high', '2025-11-28', '#aa403f', 'done', 42, '2025-04-29 13:33:31', 0),
(222, 'McKenzie Newman', 'Dolore sit cum et of', 'low', '2025-06-27', '#dc4c6b', 'todo', 42, '2025-04-29 14:56:33', 0),
(224, 'Plato Ratliff', 'Eu voluptatibus sedSGUBKRFDfgjmrftuyhfhg', 'low', '2025-08-31', '#ff96a4', 'todo', 42, '2025-04-29 14:57:05', 0),
(225, 'Merry Christmas', 'Mollit in explicabo edkfjhnrfgoljrtgohthypk[typh', 'high', '2025-06-02', '#382a3e', 'progress', 42, '2025-04-29 14:57:36', 0),
(227, 'Odette Loweer', 'Enim aliquip iure qu', 'medium', '2025-05-29', '#5adce0', 'todo', 42, '2025-04-30 06:49:06', 0),
(228, 'Tobias Foley', 'Perspiciatis qui ea', 'high', '2025-06-18', '#d189b3', 'todo', 43, '2025-04-30 08:28:30', 0),
(230, 'Sit omnis quia esse .', 'Aut tempore qui cor', 'high', '2025-07-31', '#ffffff', 'todo', 42, '2025-04-30 10:20:33', 1),
(231, 'Matthew Larson', 'Amet neque tempor d', 'medium', '2025-05-17', '#000000', 'progress', 42, '2025-04-30 11:16:14', 0),
(232, 'Garth Weeks', 'Vitae id numquam dol', 'low', '2025-12-25', '#f0de46', 'progress', 44, '2025-04-30 11:38:39', 1),
(233, 'Yeo Torres', 'Minim voluptas ea od', 'high', '2025-10-29', '#db165c', 'todo', 44, '2025-04-30 13:08:20', 1),
(234, 'Sheila Witt', 'Sint rerum corrupti', 'high', '2025-05-07', '#3d53f3', 'todo', 44, '2025-04-30 13:08:43', 1),
(235, 'Rhona Madden', 'Voluptatem vel sed u', 'low', '2025-05-07', '#bcb3f1', 'todo', 44, '2025-04-30 13:08:57', 1),
(236, 'Roanna Fulton', 'Est quo est perspic', 'medium', '2025-05-07', '#622637', 'todo', 44, '2025-04-30 13:09:07', 1),
(237, 'Jackson Whitfield', 'Eum illum veritatis', 'high', '2025-05-07', '#923aed', 'todo', 44, '2025-04-30 13:09:14', 1),
(238, 'Erica Dominguez', 'Dolor illo veniam e', 'high', '2025-09-24', '#807bda', 'todo', 43, '2025-05-01 17:04:03', 1),
(239, 'Brock Boyer', 'Quae et quia amet i', 'medium', '2025-10-24', '#31ceab', 'progress', 44, '2025-05-01 17:19:30', 1),
(240, 'Ciaran Pope', 'Cupidatat aliquip qu', 'medium', '2025-05-09', '#27e009', 'todo', 44, '2025-05-02 02:27:12', 1),
(241, 'Tyler Espinoza', 'Veniam fuga Quasi', 'low', '2025-05-13', '#27cdbc', 'progress', 43, '2025-05-04 14:52:24', 0),
(242, 'Adria Armstrong', 'Do quia veniam fugi', 'medium', '2025-05-31', '#390f6a', 'todo', 43, '2025-05-04 15:01:17', 0),
(243, 'Alfreda Cobb', 'Temporibus laboriosa', 'high', '2025-08-13', '#fed2a6', 'todo', 46, '2025-05-06 14:48:33', 0),
(244, 'Basil Hines', 'Iure exercitation vo', 'medium', '2025-05-24', '#53463b', 'todo', 42, '2025-05-17 15:48:08', 0),
(245, 'Kennedy Mcclure', 'Sint vel magnam volu', 'high', '2025-05-31', '#051c98', 'done', 42, '2025-05-17 15:48:20', 0),
(246, 'Levi Faulkner', 'Atque in nobis liber', 'low', '2025-10-24', '#99ac8a', 'todo', 41, '2025-05-18 01:00:17', 0),
(248, 'Neve Bird', 'Doloribus obcaecati', 'high', '2025-05-22', '#8f34fa', 'todo', 41, '2025-05-19 14:29:11', 0),
(249, 'mdgfjg', 'b,djcgjkc', 'medium', '2025-05-28', '#3b82f6', 'todo', 41, '2025-05-20 11:04:59', 0),
(250, 'dbfdfldg', 'jchfnslf', 'low', '2025-05-29', '#f59e0b', 'done', 41, '2025-05-20 11:09:04', 0),
(251, 'Jakeem Pennington', 'Sit ratione volupta', 'medium', '2025-05-30', '#e02b2b', 'progress', 48, '2025-05-20 12:29:06', 0);

-- --------------------------------------------------------

--
-- Table structure for table `project_categories`
--

CREATE TABLE `project_categories` (
  `id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `color` varchar(7) DEFAULT '#3b82f6',
  `position` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `project_categories`
--

INSERT INTO `project_categories` (`id`, `project_id`, `name`, `color`, `position`, `created_at`, `updated_at`) VALUES
(90, 224, 'CAT1FJFD', '#3b82f6', 1, '2025-05-11 16:06:50', '2025-05-20 08:05:49'),
(91, 224, 'CAT2', '#3b82f6', 2, '2025-05-11 16:09:09', '2025-05-12 16:09:08'),
(92, 224, 'CAT3', '#3b82f6', 3, '2025-05-11 16:12:44', '2025-05-12 16:09:53'),
(93, 224, 'CAT4', '#3b82f6', 4, '2025-05-12 15:47:05', '2025-05-12 16:09:57'),
(96, 224, 'GHGF', '#3b82f6', 5, '2025-05-12 16:14:03', '2025-05-12 16:14:03'),
(97, 191, 'gkjntfg', '#3b82f6', 1, '2025-05-16 07:36:41', '2025-05-16 07:36:41'),
(98, 224, 'sfdgdf', '#3b82f6', 6, '2025-05-16 12:11:58', '2025-05-16 12:11:58'),
(103, 202, 'DESGDF', '#3b82f6', 1, '2025-05-19 14:06:53', '2025-05-19 14:06:53'),
(104, 200, 'FTHHTG', '#3b82f6', 1, '2025-05-19 14:26:35', '2025-05-19 14:26:35'),
(105, 204, 'FDHG', '#3b82f6', 1, '2025-05-19 15:28:28', '2025-05-19 15:28:28'),
(107, 231, 'hbjkvbf vkf', '#3b82f6', 1, '2025-05-20 05:17:27', '2025-05-20 05:17:29'),
(109, 197, 'NV FV', '#3b82f6', 1, '2025-05-20 05:33:10', '2025-05-20 05:33:10'),
(112, 225, 'urgrbdf', '#3b82f6', 1, '2025-05-20 08:45:37', '2025-05-20 08:45:37'),
(113, 230, 'ignkjfg', '#3b82f6', 1, '2025-05-20 09:24:14', '2025-05-20 09:24:14'),
(114, 244, 'kldmvf', '#3b82f6', 1, '2025-05-20 09:38:10', '2025-05-20 09:38:10'),
(115, 203, 'fknvgxdgl', '#3b82f6', 1, '2025-05-20 11:07:19', '2025-05-20 11:07:19'),
(116, 251, 'CATEGORY 1', '#3b82f6', 1, '2025-05-20 12:34:22', '2025-05-20 12:34:22');

-- --------------------------------------------------------

--
-- Table structure for table `remember_tokens`
--

CREATE TABLE `remember_tokens` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token_hash` varchar(64) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NOT NULL DEFAULT (current_timestamp() + interval 30 day)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `security_questions`
--

CREATE TABLE `security_questions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `question` varchar(255) NOT NULL,
  `answer` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `security_questions`
--

INSERT INTO `security_questions` (`id`, `user_id`, `question`, `answer`, `created_at`, `updated_at`) VALUES
(21, 42, 'What city were you born in?', '$2y$10$5l7dKuv297cOaNn6Ine7z.WWFRhe4lhL/5zroB9WhgcPALacRS7TS', '2025-05-01 17:14:55', '2025-05-01 17:14:55');

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('todo','progress','done','blocked') NOT NULL DEFAULT 'todo',
  `priority` enum('high','medium','low') NOT NULL DEFAULT 'medium',
  `due_date` date DEFAULT NULL,
  `assignee_id` int(11) DEFAULT NULL,
  `position` int(11) DEFAULT 0,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `category_id`, `project_id`, `title`, `description`, `status`, `priority`, `due_date`, `assignee_id`, `position`, `created_by`, `created_at`, `updated_at`) VALUES
(149, 90, 224, 'erfjg', '<p><br></p>', 'progress', 'low', NULL, NULL, 1, 42, '2025-08-15 17:26:35', '2025-08-15 18:12:32'),
(150, 90, 224, 'RFDJG', '<p><br></p>', 'todo', 'medium', NULL, NULL, 2, 42, '2025-08-15 17:57:55', '2025-08-15 18:11:31'),
(151, 91, 224, 'RGFGH', '<p><br></p>', 'done', 'high', NULL, NULL, 1, 42, '2025-08-15 17:57:57', '2025-08-15 18:11:35'),
(152, 91, 224, 'YUIKG', '<p><br></p>', 'todo', 'low', NULL, NULL, 2, 42, '2025-08-15 17:57:58', '2025-08-15 18:11:40'),
(153, 92, 224, 'TYUJ', '<p><br></p>', 'todo', 'high', NULL, NULL, 1, 42, '2025-08-15 17:58:00', '2025-08-15 18:11:51'),
(154, 92, 224, 'YKUK', '<p><br></p>', 'todo', 'medium', NULL, NULL, 2, 42, '2025-08-15 17:58:02', '2025-08-15 18:11:57'),
(155, 93, 224, 'THTR', '', 'todo', 'medium', NULL, NULL, 1, 42, '2025-08-15 17:58:30', '2025-08-15 18:12:03'),
(156, 93, 224, 'TRHYTRF', '<p><br></p>', 'todo', 'medium', NULL, NULL, 2, 42, '2025-08-15 17:58:31', '2025-08-15 18:12:25'),
(157, 96, 224, 'RGXDRF', '', 'todo', 'medium', NULL, NULL, 1, 42, '2025-08-15 17:58:33', '2025-08-15 18:12:43'),
(158, 96, 224, 'RTUJR', '', 'todo', 'medium', NULL, NULL, 2, 42, '2025-08-15 17:58:34', '2025-08-15 18:12:52');

-- --------------------------------------------------------

--
-- Table structure for table `task_activities`
--

CREATE TABLE `task_activities` (
  `id` int(11) NOT NULL,
  `task_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `action` varchar(50) NOT NULL,
  `details` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `task_activities`
--

INSERT INTO `task_activities` (`id`, `task_id`, `user_id`, `action`, `details`, `created_at`) VALUES
(421, 149, 42, 'assignee_added', '{\"user_id\":41}', '2025-08-15 17:26:55'),
(422, 149, 42, 'assignee_added', '{\"user_id\":43}', '2025-08-15 18:11:26'),
(423, 149, 42, 'assignee_added', '{\"user_id\":44}', '2025-08-15 18:11:28'),
(424, 149, 42, 'assignee_added', '{\"user_id\":45}', '2025-08-15 18:11:30'),
(425, 150, 42, 'assignee_added', '{\"user_id\":40}', '2025-08-15 18:11:32'),
(426, 150, 42, 'assignee_added', '{\"user_id\":43}', '2025-08-15 18:11:33'),
(427, 150, 42, 'assignee_added', '{\"user_id\":44}', '2025-08-15 18:11:34'),
(428, 151, 42, 'assignee_added', '{\"user_id\":43}', '2025-08-15 18:11:38'),
(429, 151, 42, 'assignee_added', '{\"user_id\":44}', '2025-08-15 18:11:39'),
(430, 152, 42, 'assignee_added', '{\"user_id\":44}', '2025-08-15 18:11:42'),
(431, 152, 42, 'assignee_added', '{\"user_id\":45}', '2025-08-15 18:11:45'),
(432, 152, 42, 'assignee_added', '{\"user_id\":40}', '2025-08-15 18:11:48'),
(433, 153, 42, 'assignee_added', '{\"user_id\":43}', '2025-08-15 18:11:52'),
(434, 153, 42, 'assignee_added', '{\"user_id\":44}', '2025-08-15 18:11:54'),
(435, 153, 42, 'assignee_added', '{\"user_id\":45}', '2025-08-15 18:11:56'),
(436, 154, 42, 'assignee_added', '{\"user_id\":41}', '2025-08-15 18:11:58'),
(437, 154, 42, 'assignee_added', '{\"user_id\":44}', '2025-08-15 18:11:59'),
(438, 154, 42, 'assignee_added', '{\"user_id\":45}', '2025-08-15 18:12:00'),
(439, 155, 42, 'assignee_added', '{\"user_id\":44}', '2025-08-15 18:12:06'),
(440, 155, 42, 'assignee_added', '{\"user_id\":41}', '2025-08-15 18:12:08'),
(441, 155, 42, 'assignee_added', '{\"user_id\":43}', '2025-08-15 18:12:09'),
(442, 155, 42, 'assignee_added', '{\"user_id\":45}', '2025-08-15 18:12:10'),
(443, 156, 42, 'assignee_added', '{\"user_id\":40}', '2025-08-15 18:12:17'),
(444, 156, 42, 'assignee_added', '{\"user_id\":43}', '2025-08-15 18:12:19'),
(445, 156, 42, 'assignee_added', '{\"user_id\":45}', '2025-08-15 18:12:20'),
(446, 156, 42, 'assignee_added', '{\"user_id\":44}', '2025-08-15 18:12:21'),
(447, 157, 42, 'assignee_added', '{\"user_id\":43}', '2025-08-15 18:12:45'),
(448, 157, 42, 'assignee_added', '{\"user_id\":44}', '2025-08-15 18:12:46'),
(449, 157, 42, 'assignee_added', '{\"user_id\":40}', '2025-08-15 18:12:48'),
(450, 157, 42, 'assignee_added', '{\"user_id\":45}', '2025-08-15 18:12:49'),
(451, 158, 42, 'assignee_added', '{\"user_id\":41}', '2025-08-15 18:12:54'),
(452, 158, 42, 'assignee_added', '{\"user_id\":43}', '2025-08-15 18:12:56'),
(453, 158, 42, 'assignee_added', '{\"user_id\":40}', '2025-08-15 18:12:57'),
(454, 158, 42, 'assignee_added', '{\"user_id\":45}', '2025-08-15 18:12:58');

-- --------------------------------------------------------

--
-- Table structure for table `task_assignments`
--

CREATE TABLE `task_assignments` (
  `id` int(11) NOT NULL,
  `task_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `task_assignments`
--

INSERT INTO `task_assignments` (`id`, `task_id`, `user_id`, `assigned_at`) VALUES
(84, 149, 41, '2025-08-15 17:26:55'),
(85, 149, 43, '2025-08-15 18:11:26'),
(86, 149, 44, '2025-08-15 18:11:28'),
(87, 149, 45, '2025-08-15 18:11:30'),
(88, 150, 40, '2025-08-15 18:11:32'),
(89, 150, 43, '2025-08-15 18:11:33'),
(90, 150, 44, '2025-08-15 18:11:34'),
(91, 151, 43, '2025-08-15 18:11:38'),
(92, 151, 44, '2025-08-15 18:11:39'),
(93, 152, 44, '2025-08-15 18:11:42'),
(94, 152, 45, '2025-08-15 18:11:45'),
(95, 152, 40, '2025-08-15 18:11:48'),
(96, 153, 43, '2025-08-15 18:11:52'),
(97, 153, 44, '2025-08-15 18:11:54'),
(98, 153, 45, '2025-08-15 18:11:56'),
(99, 154, 41, '2025-08-15 18:11:58'),
(100, 154, 44, '2025-08-15 18:11:59'),
(101, 154, 45, '2025-08-15 18:12:00'),
(102, 155, 44, '2025-08-15 18:12:06'),
(103, 155, 41, '2025-08-15 18:12:08'),
(104, 155, 43, '2025-08-15 18:12:09'),
(105, 155, 45, '2025-08-15 18:12:10'),
(106, 156, 40, '2025-08-15 18:12:17'),
(107, 156, 43, '2025-08-15 18:12:19'),
(108, 156, 45, '2025-08-15 18:12:20'),
(109, 156, 44, '2025-08-15 18:12:21'),
(110, 157, 43, '2025-08-15 18:12:45'),
(111, 157, 44, '2025-08-15 18:12:46'),
(112, 157, 40, '2025-08-15 18:12:48'),
(113, 157, 45, '2025-08-15 18:12:49'),
(114, 158, 41, '2025-08-15 18:12:54'),
(115, 158, 43, '2025-08-15 18:12:56'),
(116, 158, 40, '2025-08-15 18:12:57'),
(117, 158, 45, '2025-08-15 18:12:58');

-- --------------------------------------------------------

--
-- Table structure for table `task_attachments`
--

CREATE TABLE `task_attachments` (
  `id` int(11) NOT NULL,
  `task_id` int(11) NOT NULL,
  `uploaded_by` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_size` int(11) NOT NULL,
  `file_type` varchar(100) NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `task_comments`
--

CREATE TABLE `task_comments` (
  `id` int(11) NOT NULL,
  `task_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `task_links`
--

CREATE TABLE `task_links` (
  `id` int(11) NOT NULL,
  `task_id` int(11) NOT NULL,
  `url` varchar(255) NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `profile_picture` varchar(255) DEFAULT 'Images/profile.PNG',
  `default_facility_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `created_at`, `updated_at`, `profile_picture`, `default_facility_id`) VALUES
(40, 'Calista Herman', 'fino@mailinator.com', '$2y$10$z.z/BjEifOinZfypO359z.EM7GVb1suh1zlfRfNVC8BFuSuQ5FK7y', '2025-04-25 03:00:23', '2025-04-25 03:00:44', 'Images/profile.PNG', 27),
(41, 'McKenzie Reilly', 'pomotudofo@mailinator.com', '$2y$10$OCg0Hy8hT6/esUE0stURu.891MqNf6WawzPI/19mwaY86kQhocBEy', '2025-04-25 03:24:14', '2025-05-17 00:28:55', 'uploads/profile_pictures/user_41_1747441735.jpg', 28),
(42, 'Rafael Guy', 'typuk@mailinator.com', '$2y$10$79AN8f0yA/wfD7Fu4rlNJ.lu2RM8VlT.gOJ1UIuIipz4W/490ZdFi', '2025-04-25 06:48:31', '2025-04-25 06:52:30', 'uploads/profile_pictures/user_42_1745563950.jpg', 29),
(43, 'Rosalyn Harmon', 'dimeto@mailinator.com', '$2y$10$tmRp4fhAUdkWN6L0C3.3yu6KiRI7KWgxm232P.etGSyGCW3GH.FGS', '2025-04-25 09:34:49', '2025-05-16 07:37:09', 'uploads/profile_pictures/user_43_1747381029.jpg', 30),
(44, 'Mechelle Rutledge', 'kykebe@mailinator.com', '$2y$10$t8pFlZLsBvsn6FPAB56M7uK3ZjC/2dbMaAXWrGFp5fmdfbkTrWt/K', '2025-04-25 09:37:42', '2025-04-29 14:06:30', 'uploads/profile_pictures/user_44_1745935590.jpg', 31),
(45, 'Rhoda Christensen', 'gona@mailinator.com', '$2y$10$h4omxnZkMkasb3ajpCwAieK4ABMCMXw.5H20Wn8m1.WhAjw9xSmoW', '2025-04-26 11:04:13', '2025-04-26 11:04:26', 'Images/profile.PNG', 32),
(46, 'Ross Erickson', 'ceto@mailinator.com', '$2y$10$OyPdLjYcAB3ErOjnRD6/Y.EUtnWAApmngEPB5abeQcxC517atMVvS', '2025-05-06 14:48:19', '2025-05-06 14:49:04', 'Images/profile.PNG', 33),
(47, 'Benjamin Petersen', 'rovijec@mailinator.com', '$2y$10$jNWzX3C.v.SCL.4d2LOwK.HTXdR1wfiFcWeqhOerykIBXbagt7Y0.', '2025-05-20 12:25:02', '2025-05-20 12:25:02', 'Images/profile.PNG', NULL),
(48, 'Riley Melton', 'gini@mailinator.com', '$2y$10$NXeELfUSj6ZPJFWjQ9pGpe/dhrWVfx.iALv.IiXlPj4RJeAu6XGWy', '2025-05-20 12:27:55', '2025-05-20 12:40:37', 'Images/profile.PNG', 35),
(49, 'Belle Nieves', 'xuhicybude@mailinator.com', '$2y$10$52AQnaOAknALTCNpJnxm1ODXLwkDFH1K7TMEIy3lfx2u/hNvtfBiK', '2025-08-15 14:43:12', '2025-08-15 14:43:22', 'Images/profile.PNG', 36);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `email_confirmations`
--
ALTER TABLE `email_confirmations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `facilities`
--
ALTER TABLE `facilities`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `owner_id` (`owner_id`);

--
-- Indexes for table `facility_admins`
--
ALTER TABLE `facility_admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `facility_user` (`facility_id`,`user_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `assigned_by` (`assigned_by`);

--
-- Indexes for table `facility_invitations`
--
ALTER TABLE `facility_invitations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `facility_id` (`facility_id`),
  ADD KEY `invited_by` (`invited_by`);

--
-- Indexes for table `facility_members`
--
ALTER TABLE `facility_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `facility_user` (`facility_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `owner_id` (`owner_id`);

--
-- Indexes for table `project_categories`
--
ALTER TABLE `project_categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_id` (`project_id`);

--
-- Indexes for table `remember_tokens`
--
ALTER TABLE `remember_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token_hash` (`token_hash`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `security_questions`
--
ALTER TABLE `security_questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `project_id` (`project_id`),
  ADD KEY `assignee_id` (`assignee_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `task_activities`
--
ALTER TABLE `task_activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `task_id` (`task_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `task_assignments`
--
ALTER TABLE `task_assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `task_user` (`task_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `task_attachments`
--
ALTER TABLE `task_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `task_id` (`task_id`),
  ADD KEY `uploaded_by` (`uploaded_by`);

--
-- Indexes for table `task_comments`
--
ALTER TABLE `task_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `task_id` (`task_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `task_links`
--
ALTER TABLE `task_links`
  ADD PRIMARY KEY (`id`),
  ADD KEY `task_id` (`task_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `email_2` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `email_confirmations`
--
ALTER TABLE `email_confirmations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `facilities`
--
ALTER TABLE `facilities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `facility_admins`
--
ALTER TABLE `facility_admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT for table `facility_invitations`
--
ALTER TABLE `facility_invitations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `facility_members`
--
ALTER TABLE `facility_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=253;

--
-- AUTO_INCREMENT for table `project_categories`
--
ALTER TABLE `project_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=117;

--
-- AUTO_INCREMENT for table `remember_tokens`
--
ALTER TABLE `remember_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `security_questions`
--
ALTER TABLE `security_questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=159;

--
-- AUTO_INCREMENT for table `task_activities`
--
ALTER TABLE `task_activities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=455;

--
-- AUTO_INCREMENT for table `task_assignments`
--
ALTER TABLE `task_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=118;

--
-- AUTO_INCREMENT for table `task_attachments`
--
ALTER TABLE `task_attachments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `task_comments`
--
ALTER TABLE `task_comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=92;

--
-- AUTO_INCREMENT for table `task_links`
--
ALTER TABLE `task_links`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `email_confirmations`
--
ALTER TABLE `email_confirmations`
  ADD CONSTRAINT `email_confirmations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `facilities`
--
ALTER TABLE `facilities`
  ADD CONSTRAINT `facilities_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `facility_admins`
--
ALTER TABLE `facility_admins`
  ADD CONSTRAINT `facility_admins_ibfk_1` FOREIGN KEY (`facility_id`) REFERENCES `facilities` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `facility_admins_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `facility_admins_ibfk_3` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `facility_invitations`
--
ALTER TABLE `facility_invitations`
  ADD CONSTRAINT `facility_invitations_ibfk_1` FOREIGN KEY (`facility_id`) REFERENCES `facilities` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `facility_invitations_ibfk_2` FOREIGN KEY (`invited_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `facility_members`
--
ALTER TABLE `facility_members`
  ADD CONSTRAINT `facility_members_ibfk_1` FOREIGN KEY (`facility_id`) REFERENCES `facilities` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `facility_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `project_categories`
--
ALTER TABLE `project_categories`
  ADD CONSTRAINT `project_categories_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `remember_tokens`
--
ALTER TABLE `remember_tokens`
  ADD CONSTRAINT `remember_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `security_questions`
--
ALTER TABLE `security_questions`
  ADD CONSTRAINT `security_questions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `project_categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tasks_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tasks_ibfk_3` FOREIGN KEY (`assignee_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `tasks_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `task_attachments`
--
ALTER TABLE `task_attachments`
  ADD CONSTRAINT `task_attachments_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`),
  ADD CONSTRAINT `task_attachments_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `task_comments`
--
ALTER TABLE `task_comments`
  ADD CONSTRAINT `task_comments_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `task_comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `task_links`
--
ALTER TABLE `task_links`
  ADD CONSTRAINT `task_links_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `task_links_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
