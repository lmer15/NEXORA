-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 20, 2025 at 03:03 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

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
(35, 'Riley Melton\'s Facility', '99VIIG4X', 48, '2025-05-20 12:27:55', '2025-05-20 12:27:55');

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
(56, 35, 41, 48, '2025-05-20 12:41:30');

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
(58, 35, 42, '2025-05-20 12:41:15');

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
(197, 'Lilah Meadowss', 'Quis qui illo sit inssss', 'low', '2025-05-15', '#4bdfdc', 'done', 42, '2025-04-27 19:10:07', 0),
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
(224, 'Plato Ratliff', 'Eu voluptatibus sedSGUBKRFDfgjmrftuyhfhg', 'low', '2025-05-31', '#ff96a4', 'todo', 42, '2025-04-29 14:57:05', 0),
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
(96, 93, 224, 'TASK G', 'fgxgfh', 'done', 'high', '2025-05-30', NULL, 2, 42, '2025-05-11 16:06:53', '2025-05-19 17:56:31'),
(97, 90, 224, 'TASK D', '<p>sfgfgnh</p>', 'todo', 'medium', '2025-05-30', NULL, 2, 42, '2025-05-11 16:07:12', '2025-05-20 09:53:25'),
(98, 91, 224, 'TASK E', '<p>rytrhytr</p>', 'blocked', 'medium', '2025-05-31', NULL, 2, 42, '2025-05-11 16:08:07', '2025-05-20 10:01:31'),
(99, 91, 224, 'TASK C', '', 'todo', 'medium', '2025-05-31', NULL, 3, 42, '2025-05-11 16:08:12', '2025-05-12 19:14:47'),
(100, 92, 224, 'TASK I', '<p>SDFSHDJGF</p>', 'todo', 'medium', '2025-05-31', NULL, 3, 42, '2025-05-11 16:09:13', '2025-05-16 12:06:43'),
(101, 91, 224, 'TASK C', '<p>EFHSTRY</p>', 'todo', 'high', '2025-05-24', NULL, 1, 42, '2025-05-11 16:09:17', '2025-05-20 11:48:39'),
(102, 96, 224, 'TASK H', '<p><br></p>', 'done', 'high', '2025-06-06', NULL, 2, 42, '2025-05-11 16:12:08', '2025-05-16 12:37:40'),
(103, 90, 224, 'TASK A', '<p>DGHXHdsfdsFGTR</p>', 'done', 'medium', '2025-04-25', NULL, 1, 42, '2025-05-12 10:07:48', '2025-05-20 11:48:53'),
(104, 92, 224, 'TASK F', '<p>SDGGH</p>', 'progress', 'medium', '2025-05-24', NULL, 1, 42, '2025-05-12 10:07:50', '2025-05-16 12:39:18'),
(105, 90, 224, 'TASK B', 'VFBHGF', 'done', 'low', '2025-05-31', NULL, 3, 42, '2025-05-12 10:07:51', '2025-05-19 17:08:53'),
(106, 92, 224, 'TASK K', '', 'todo', 'low', '2025-05-14', NULL, 2, 42, '2025-05-12 10:08:55', '2025-05-16 12:06:43'),
(107, 93, 224, 'TASK J', 'FRBHDKLBMHJFGERYERYERYERYERYERYERYERYERYERYERYERYERYERYERY', 'done', 'low', '2025-05-24', NULL, 1, 42, '2025-05-12 10:08:57', '2025-05-19 17:26:39'),
(108, 97, 191, 'refttrn', '<p><strong>srdy</strong></p>', 'todo', 'medium', NULL, NULL, 1, 43, '2025-05-16 07:36:44', '2025-05-16 07:37:33'),
(109, 98, 224, 'rtytes', '<p>deffdvffgjhgggfktghreof</p>', 'progress', 'low', '2025-05-20', NULL, 1, 42, '2025-05-16 12:12:14', '2025-05-20 07:07:42'),
(110, 98, 224, 'tryyuj', '<p><br></p>', 'todo', 'medium', '2025-05-24', NULL, 2, 42, '2025-05-16 12:12:16', '2025-05-16 12:35:41'),
(112, 96, 224, 'tyuyr', '', 'todo', 'medium', '2025-06-07', NULL, 1, 42, '2025-05-16 12:12:22', '2025-05-19 17:26:37'),
(113, 96, 224, 'tggh', '<p><br></p>', 'todo', 'medium', '2025-05-27', NULL, 3, 42, '2025-05-16 12:12:32', '2025-05-16 12:37:46'),
(114, 93, 224, 'retg', '', 'todo', 'medium', '2025-05-24', NULL, 3, 42, '2025-05-16 12:12:35', '2025-05-19 17:26:40'),
(115, 98, 224, 'Project Management System | Role of the Userstytryuty', '<p>retgertygytyrjhf</p>', 'progress', 'low', '2025-05-31', NULL, 3, 42, '2025-05-16 12:35:35', '2025-05-20 09:53:05'),
(120, 103, 202, 'RGF', '', 'todo', 'low', NULL, NULL, 1, 41, '2025-05-19 14:06:55', '2025-05-20 09:57:36'),
(121, 104, 200, 'HRTYHGT', '<p><br></p>', 'todo', 'medium', NULL, NULL, 1, 41, '2025-05-19 14:26:41', '2025-05-20 11:06:39'),
(126, 105, 204, 'TGDRFT', '<p><br></p>', 'todo', 'medium', NULL, NULL, 1, 41, '2025-05-19 15:29:06', '2025-05-19 15:29:09'),
(127, 103, 202, 'FJNG', '<p><br></p>', 'done', 'low', NULL, NULL, 0, 42, '2025-05-20 05:33:02', '2025-05-20 12:53:57'),
(128, 109, 197, 'SNVGG', '<p>NBG</p><p><br></p>', 'progress', 'low', '2025-05-24', NULL, 0, 42, '2025-05-20 05:33:12', '2025-05-20 09:51:51'),
(131, 103, 202, 'RH\\', '<p><br></p>', 'done', 'low', NULL, NULL, 0, 42, '2025-05-20 06:03:34', '2025-05-20 12:54:03'),
(135, 107, 231, 'kjdfgdfb', '<p><br></p>', 'todo', 'low', '0000-00-00', NULL, 1, 42, '2025-05-20 07:30:32', '2025-05-20 07:30:37'),
(138, 103, 202, 'EFCHBDF', '', 'todo', 'medium', NULL, NULL, 2, 42, '2025-05-20 07:48:57', '2025-05-20 08:46:04'),
(141, 112, 225, 'rht', '<p><br></p>', 'progress', 'high', '2025-05-31', NULL, 1, 42, '2025-05-20 08:45:38', '2025-05-20 08:45:51'),
(142, 113, 230, 'njkcffj f', '<p><br></p>', 'done', 'medium', NULL, NULL, 1, 42, '2025-05-20 09:24:17', '2025-05-20 09:24:24'),
(143, 113, 230, 'kdvgnhg', '', 'todo', 'medium', NULL, NULL, 2, 42, '2025-05-20 09:24:20', '2025-05-20 09:24:20'),
(144, 114, 244, 'dklffg', '<p><br></p>', 'todo', 'medium', '2025-05-30', NULL, 1, 42, '2025-05-20 09:38:12', '2025-05-20 11:30:56'),
(145, 115, 203, 'sfngdbgnxgf', '<p>dvfmggfhghgh</p>', 'todo', 'medium', NULL, NULL, 1, 41, '2025-05-20 11:07:22', '2025-05-20 11:31:14'),
(147, 116, 251, 'TASK 1', '<p><br></p>', 'progress', 'medium', NULL, NULL, 1, 48, '2025-05-20 12:34:33', '2025-05-20 12:42:40');

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
(136, 98, 42, 'priority_updated', '{\"old_priority\":\"medium\",\"new_priority\":\"low\"}', '2025-05-12 07:30:45'),
(137, 98, 42, 'priority_updated', '{\"old_priority\":\"low\",\"new_priority\":\"high\"}', '2025-05-12 07:30:47'),
(138, 98, 42, 'status_updated', '{\"old_status\":\"todo\",\"new_status\":\"blocked\"}', '2025-05-12 07:30:51'),
(139, 99, 42, 'comment_added', NULL, '2025-05-12 08:45:03'),
(140, 101, 42, 'status_updated', '{\"old_status\":\"todo\",\"new_status\":\"done\"}', '2025-05-12 08:51:06'),
(141, 101, 42, 'status_updated', '{\"old_status\":\"done\",\"new_status\":\"todo\"}', '2025-05-12 08:51:07'),
(142, 101, 42, 'priority_updated', '{\"old_priority\":\"medium\",\"new_priority\":\"low\"}', '2025-05-12 08:51:11'),
(143, 101, 42, 'priority_updated', '{\"old_priority\":\"low\",\"new_priority\":\"high\"}', '2025-05-12 08:51:12'),
(144, 101, 42, 'comment_added', NULL, '2025-05-12 08:51:22'),
(145, 96, 42, 'comment_added', NULL, '2025-05-12 09:46:50'),
(146, 96, 42, 'comment_added', NULL, '2025-05-12 09:46:52'),
(147, 96, 42, 'status_updated', '{\"old_status\":\"todo\",\"new_status\":\"blocked\"}', '2025-05-12 09:46:57'),
(148, 96, 42, 'status_updated', '{\"old_status\":\"blocked\",\"new_status\":\"todo\"}', '2025-05-12 09:46:58'),
(149, 96, 42, 'status_updated', '{\"old_status\":\"todo\",\"new_status\":\"done\"}', '2025-05-12 09:47:00'),
(150, 96, 42, 'priority_updated', '{\"old_priority\":\"medium\",\"new_priority\":\"low\"}', '2025-05-12 09:47:02'),
(151, 102, 42, 'comment_added', NULL, '2025-05-12 10:02:19'),
(152, 102, 42, 'comment_added', NULL, '2025-05-12 10:02:21'),
(153, 102, 42, 'comment_added', NULL, '2025-05-12 10:02:23'),
(154, 102, 42, 'status_updated', '{\"old_status\":\"todo\",\"new_status\":\"done\"}', '2025-05-12 10:02:35'),
(155, 105, 42, 'priority_updated', '{\"old_priority\":\"medium\",\"new_priority\":\"low\"}', '2025-05-12 10:08:07'),
(156, 105, 42, 'status_updated', '{\"old_status\":\"todo\",\"new_status\":\"done\"}', '2025-05-12 10:08:11'),
(157, 105, 42, 'comment_added', NULL, '2025-05-12 10:08:16'),
(158, 105, 42, 'comment_added', NULL, '2025-05-12 10:08:17'),
(159, 105, 42, 'comment_added', NULL, '2025-05-12 10:25:15'),
(160, 103, 42, 'comment_added', NULL, '2025-05-12 13:50:28'),
(161, 102, 42, 'priority_updated', '{\"old_priority\":\"medium\",\"new_priority\":\"high\"}', '2025-05-12 13:52:07'),
(162, 102, 42, 'priority_updated', '{\"old_priority\":\"high\",\"new_priority\":\"low\"}', '2025-05-12 13:52:08'),
(163, 102, 42, 'priority_updated', '{\"old_priority\":\"low\",\"new_priority\":\"medium\"}', '2025-05-12 13:52:09'),
(164, 102, 42, 'priority_updated', '{\"old_priority\":\"medium\",\"new_priority\":\"high\"}', '2025-05-12 13:52:10'),
(165, 102, 42, 'priority_updated', '{\"old_priority\":\"high\",\"new_priority\":\"low\"}', '2025-05-12 13:52:11'),
(166, 102, 42, 'priority_updated', '{\"old_priority\":\"low\",\"new_priority\":\"high\"}', '2025-05-12 13:52:19'),
(167, 102, 42, 'status_updated', '{\"old_status\":\"done\",\"new_status\":\"progress\"}', '2025-05-12 13:52:21'),
(168, 102, 42, 'status_updated', '{\"old_status\":\"progress\",\"new_status\":\"done\"}', '2025-05-12 13:52:24'),
(169, 104, 42, 'status_updated', '{\"old_status\":\"todo\",\"new_status\":\"progress\"}', '2025-05-12 15:33:12'),
(170, 103, 42, 'assignee_added', '{\"user_id\":41}', '2025-05-12 15:47:32'),
(171, 103, 42, 'comment_added', NULL, '2025-05-12 15:50:18'),
(172, 103, 42, 'priority_updated', '{\"old_priority\":\"medium\",\"new_priority\":\"low\"}', '2025-05-12 15:57:44'),
(173, 103, 42, 'priority_updated', '{\"old_priority\":\"low\",\"new_priority\":\"high\"}', '2025-05-12 15:57:44'),
(174, 103, 42, 'priority_updated', '{\"old_priority\":\"high\",\"new_priority\":\"medium\"}', '2025-05-12 15:57:45'),
(175, 103, 42, 'status_updated', '{\"old_status\":\"todo\",\"new_status\":\"done\"}', '2025-05-12 15:57:47'),
(176, 106, 42, 'priority_updated', '{\"old_priority\":\"medium\",\"new_priority\":\"low\"}', '2025-05-12 15:59:19'),
(177, 106, 42, 'comment_added', NULL, '2025-05-12 15:59:22'),
(178, 100, 42, 'comment_added', NULL, '2025-05-12 16:00:54'),
(179, 103, 42, 'priority_updated', '{\"old_priority\":\"medium\",\"new_priority\":\"high\"}', '2025-05-12 16:03:00'),
(180, 103, 42, 'priority_updated', '{\"old_priority\":\"high\",\"new_priority\":\"low\"}', '2025-05-12 16:03:01'),
(181, 103, 42, 'status_updated', '{\"old_status\":\"done\",\"new_status\":\"todo\"}', '2025-05-12 16:03:03'),
(182, 103, 42, 'status_updated', '{\"old_status\":\"todo\",\"new_status\":\"done\"}', '2025-05-12 16:03:05'),
(183, 107, 42, 'status_updated', '{\"old_status\":\"todo\",\"new_status\":\"done\"}', '2025-05-12 16:13:21'),
(184, 107, 42, 'priority_updated', '{\"old_priority\":\"medium\",\"new_priority\":\"low\"}', '2025-05-12 16:13:23'),
(185, 103, 42, 'priority_updated', '{\"old_priority\":\"low\",\"new_priority\":\"medium\"}', '2025-05-12 18:51:31'),
(186, 103, 42, 'priority_updated', '{\"old_priority\":\"medium\",\"new_priority\":\"low\"}', '2025-05-12 19:12:45'),
(187, 103, 42, 'priority_updated', '{\"old_priority\":\"low\",\"new_priority\":\"high\"}', '2025-05-12 19:12:47'),
(188, 103, 42, 'status_updated', '{\"old_status\":\"done\",\"new_status\":\"progress\"}', '2025-05-12 19:12:52'),
(189, 103, 42, 'status_updated', '{\"old_status\":\"progress\",\"new_status\":\"blocked\"}', '2025-05-12 19:12:54'),
(190, 103, 42, 'comment_added', NULL, '2025-05-12 19:15:11'),
(191, 107, 42, 'comment_added', NULL, '2025-05-16 04:09:17'),
(192, 103, 42, 'priority_updated', '{\"old_priority\":\"high\",\"new_priority\":\"low\"}', '2025-05-16 07:11:11'),
(193, 103, 42, 'priority_updated', '{\"old_priority\":\"low\",\"new_priority\":\"medium\"}', '2025-05-16 07:11:13'),
(194, 103, 42, 'status_updated', '{\"old_status\":\"blocked\",\"new_status\":\"todo\"}', '2025-05-16 07:27:57'),
(195, 103, 42, 'status_updated', '{\"old_status\":\"todo\",\"new_status\":\"progress\"}', '2025-05-16 07:28:01'),
(196, 103, 42, 'comment_added', NULL, '2025-05-16 07:28:09'),
(197, 108, 43, 'comment_added', NULL, '2025-05-16 07:37:21'),
(198, 108, 43, 'assignee_added', '{\"user_id\":43}', '2025-05-16 07:40:08'),
(199, 108, 43, 'assignee_added', '{\"user_id\":44}', '2025-05-16 07:42:47'),
(200, 103, 42, 'assignee_added', '{\"user_id\":42}', '2025-05-16 08:01:14'),
(201, 103, 42, 'priority_updated', '{\"old_priority\":\"medium\",\"new_priority\":\"low\"}', '2025-05-16 08:13:10'),
(202, 103, 42, 'priority_updated', '{\"old_priority\":\"low\",\"new_priority\":\"high\"}', '2025-05-16 08:13:11'),
(203, 103, 42, 'priority_updated', '{\"old_priority\":\"high\",\"new_priority\":\"low\"}', '2025-05-16 08:13:12'),
(204, 103, 42, 'priority_updated', '{\"old_priority\":\"low\",\"new_priority\":\"high\"}', '2025-05-16 08:13:13'),
(205, 103, 42, 'file_uploaded', '{\"file_name\":\"circuit_image.png\",\"file_size\":1405060}', '2025-05-16 08:29:08'),
(206, 103, 42, 'file_uploaded', '{\"file_name\":\"Screenshot 2025-04-28 163654.png\",\"file_size\":146398}', '2025-05-16 08:32:06'),
(207, 103, 42, 'file_uploaded', '{\"file_name\":\"log.txt\",\"file_size\":1899911}', '2025-05-16 08:37:59'),
(208, 103, 42, 'status_updated', '{\"old_status\":\"progress\",\"new_status\":\"done\"}', '2025-05-16 08:38:29'),
(209, 103, 42, 'file_uploaded', '{\"file_name\":\"Operations Memo.docx\",\"file_size\":70223}', '2025-05-16 08:39:05'),
(210, 103, 42, 'priority_updated', '{\"old_priority\":\"high\",\"new_priority\":\"medium\"}', '2025-05-16 08:39:54'),
(211, 103, 42, 'file_uploaded', '{\"file_name\":\"EVALUATION FORM.docx\",\"file_size\":48763}', '2025-05-16 09:06:01'),
(212, 103, 42, 'link_added', '{\"url\":\"https:\\/\\/www.techspot.com\\/downloads\\/7358-xampp.html\",\"title\":null}', '2025-05-16 09:48:37'),
(213, 103, 42, 'assignee_added', '{\"user_id\":40}', '2025-05-16 10:05:58'),
(214, 103, 42, 'assignee_added', '{\"user_id\":44}', '2025-05-16 10:07:20'),
(215, 103, 42, 'assignee_added', '{\"user_id\":46}', '2025-05-16 10:07:37'),
(216, 103, 42, 'assignee_added', '{\"user_id\":41}', '2025-05-16 10:07:39'),
(217, 103, 42, 'assignee_added', '{\"user_id\":43}', '2025-05-16 10:09:03'),
(218, 103, 42, 'priority_updated', '{\"old_priority\":\"medium\",\"new_priority\":\"high\"}', '2025-05-16 10:46:29'),
(219, 103, 42, 'priority_updated', '{\"old_priority\":\"high\",\"new_priority\":\"low\"}', '2025-05-16 10:46:30'),
(220, 103, 42, 'priority_updated', '{\"old_priority\":\"low\",\"new_priority\":\"medium\"}', '2025-05-16 10:46:31'),
(221, 103, 42, 'priority_updated', '{\"old_priority\":\"medium\",\"new_priority\":\"high\"}', '2025-05-16 10:46:31'),
(222, 109, 42, 'assignee_added', '{\"user_id\":40}', '2025-05-16 12:12:41'),
(223, 109, 42, 'assignee_added', '{\"user_id\":43}', '2025-05-16 12:12:45'),
(224, 109, 42, 'assignee_added', '{\"user_id\":44}', '2025-05-16 12:12:47'),
(225, 109, 42, 'assignee_added', '{\"user_id\":46}', '2025-05-16 12:12:49'),
(226, 109, 42, 'assignee_added', '{\"user_id\":41}', '2025-05-16 12:12:50'),
(227, 109, 42, 'link_added', '{\"url\":\"https:\\/\\/docs.google.com\\/spreadsheets\\/d\\/1Mwc-1RKR7g283yL3kKwBMJ7cxKz0HZyFPahsyjuCegE\\/edit?pli=1&gid=769231142#gid=769231142\",\"title\":null}', '2025-05-16 12:14:53'),
(228, 109, 42, 'file_uploaded', '{\"file_name\":\"PRODUCT INVENTORY.docx\",\"file_size\":217552}', '2025-05-16 12:17:54'),
(229, 109, 42, 'file_uploaded', '{\"file_name\":\"Operations Memo.docx\",\"file_size\":70223}', '2025-05-16 12:18:11'),
(230, 109, 42, 'file_uploaded', '{\"file_name\":\"GROUP 1 RIZAL ROLEPLAY SCRIPT .pdf\",\"file_size\":147169}', '2025-05-16 12:23:47'),
(231, 110, 42, 'assignee_added', '{\"user_id\":40}', '2025-05-16 12:27:37'),
(232, 110, 42, 'assignee_added', '{\"user_id\":44}', '2025-05-16 12:27:40'),
(233, 110, 42, 'assignee_added', '{\"user_id\":46}', '2025-05-16 12:27:42'),
(234, 115, 42, 'assignee_added', '{\"user_id\":41}', '2025-05-16 12:35:47'),
(235, 115, 42, 'assignee_added', '{\"user_id\":46}', '2025-05-16 12:35:50'),
(236, 115, 42, 'assignee_removed', '{\"user_id\":\"41\"}', '2025-05-16 12:35:50'),
(237, 115, 42, 'assignee_added', '{\"user_id\":41}', '2025-05-16 12:35:52'),
(238, 115, 42, 'assignee_added', '{\"user_id\":40}', '2025-05-16 12:35:52'),
(239, 115, 42, 'assignee_removed', '{\"user_id\":\"46\"}', '2025-05-16 12:35:52'),
(240, 115, 42, 'assignee_added', '{\"user_id\":46}', '2025-05-16 12:35:56'),
(241, 115, 42, 'assignee_removed', '{\"user_id\":\"40\"}', '2025-05-16 12:35:56'),
(242, 115, 42, 'assignee_removed', '{\"user_id\":\"41\"}', '2025-05-16 12:35:56'),
(243, 115, 42, 'assignee_added', '{\"user_id\":43}', '2025-05-16 12:35:58'),
(244, 115, 42, 'assignee_added', '{\"user_id\":41}', '2025-05-16 12:36:04'),
(245, 115, 42, 'assignee_added', '{\"user_id\":40}', '2025-05-16 12:36:07'),
(246, 112, 42, 'assignee_added', '{\"user_id\":41}', '2025-05-16 12:36:28'),
(247, 102, 42, 'assignee_added', '{\"user_id\":44}', '2025-05-16 12:36:31'),
(248, 102, 42, 'assignee_added', '{\"user_id\":41}', '2025-05-16 12:36:33'),
(249, 113, 42, 'assignee_added', '{\"user_id\":40}', '2025-05-16 12:36:36'),
(250, 96, 42, 'assignee_added', '{\"user_id\":43}', '2025-05-16 12:36:39'),
(251, 96, 42, 'assignee_added', '{\"user_id\":41}', '2025-05-16 12:36:41'),
(252, 96, 42, 'assignee_removed', '{\"user_id\":\"43\"}', '2025-05-16 12:36:41'),
(253, 96, 42, 'assignee_added', '{\"user_id\":43}', '2025-05-16 12:36:44'),
(254, 96, 42, 'assignee_added', '{\"user_id\":40}', '2025-05-16 12:36:44'),
(255, 96, 42, 'assignee_removed', '{\"user_id\":\"41\"}', '2025-05-16 12:36:44'),
(256, 107, 42, 'assignee_added', '{\"user_id\":44}', '2025-05-16 12:36:48'),
(257, 107, 42, 'assignee_added', '{\"user_id\":41}', '2025-05-16 12:36:50'),
(258, 107, 42, 'assignee_removed', '{\"user_id\":\"44\"}', '2025-05-16 12:36:50'),
(259, 107, 42, 'assignee_added', '{\"user_id\":44}', '2025-05-16 12:36:53'),
(260, 107, 42, 'assignee_added', '{\"user_id\":40}', '2025-05-16 12:36:53'),
(261, 107, 42, 'assignee_removed', '{\"user_id\":\"41\"}', '2025-05-16 12:36:53'),
(262, 114, 42, 'assignee_added', '{\"user_id\":41}', '2025-05-16 12:36:56'),
(263, 114, 42, 'assignee_added', '{\"user_id\":46}', '2025-05-16 12:36:59'),
(264, 114, 42, 'assignee_removed', '{\"user_id\":\"41\"}', '2025-05-16 12:36:59'),
(265, 114, 42, 'assignee_added', '{\"user_id\":41}', '2025-05-16 12:37:01'),
(266, 104, 42, 'assignee_added', '{\"user_id\":41}', '2025-05-16 12:39:19'),
(267, 104, 42, 'assignee_added', '{\"user_id\":46}', '2025-05-16 12:39:21'),
(268, 109, 42, 'status_updated', '{\"old_status\":\"todo\",\"new_status\":\"done\"}', '2025-05-16 13:13:45'),
(269, 112, 42, 'assignee_added', '{\"user_id\":43}', '2025-05-16 15:12:52'),
(270, 109, 42, 'priority_updated', '{\"old_priority\":\"medium\",\"new_priority\":\"low\"}', '2025-05-16 23:57:52'),
(271, 109, 42, 'priority_updated', '{\"old_priority\":\"low\",\"new_priority\":\"high\"}', '2025-05-16 23:57:54'),
(272, 109, 42, 'priority_updated', '{\"old_priority\":\"high\",\"new_priority\":\"low\"}', '2025-05-16 23:57:54'),
(273, 109, 42, 'status_updated', '{\"old_status\":\"done\",\"new_status\":\"progress\"}', '2025-05-16 23:57:56'),
(274, 113, 42, 'link_added', '{\"url\":\"https:\\/\\/www.google.com\\/search?q=tm+sim+registration&oq=&gs_lcrp=EgZjaHJvbWUqCQgEECMYJxjqAjIJCAAQIxgnGOoCMgkIARAjGCcY6gIyCQgCECMYJxjqAjIJCAMQIxgnGOoCMgkIBBAjGCcY6gIyDAgFECMYJxjqAhi0BDIMCAYQIxgnGOoCGLQEMgwIBxAjGCcY6gIYtATSAQk5MjQ2NmowajeoAgiwAgHxBd2U48AP1h5e&sourceid=chrome&ie=UTF-8\",\"title\":null}', '2025-05-16 23:58:34'),
(275, 100, 42, 'assignee_added', '{\"user_id\":40}', '2025-05-17 00:26:53'),
(276, 115, 42, 'comment_added', NULL, '2025-05-17 09:01:39'),
(277, 115, 42, 'link_added', '{\"url\":\"https:\\/\\/docs.google.com\\/spreadsheets\\/d\\/1Mwc-1RKR7g283yL3kKwBMJ7cxKz0HZyFPahsyjuCegE\\/edit?pli=1&gid=769231142#gid=769231142\",\"title\":null}', '2025-05-17 09:01:48'),
(278, 115, 42, 'file_uploaded', '{\"file_name\":\"TEAM NEXORA - SURVEY RESEARCH.pdf\",\"file_size\":180935}', '2025-05-17 09:01:53'),
(279, 115, 42, 'status_updated', '{\"old_status\":\"todo\",\"new_status\":\"done\"}', '2025-05-17 09:02:03'),
(280, 115, 42, 'status_updated', '{\"old_status\":\"done\",\"new_status\":\"progress\"}', '2025-05-17 09:02:06'),
(281, 115, 42, 'priority_updated', '{\"old_priority\":\"medium\",\"new_priority\":\"high\"}', '2025-05-17 09:02:10'),
(282, 115, 42, 'priority_updated', '{\"old_priority\":\"high\",\"new_priority\":\"low\"}', '2025-05-17 09:02:12'),
(283, 110, 42, 'assignee_added', '{\"user_id\":41}', '2025-05-17 09:12:18'),
(284, 110, 42, 'assignee_added', '{\"user_id\":43}', '2025-05-17 09:12:41'),
(285, 115, 42, 'assignee_added', '{\"user_id\":44}', '2025-05-17 09:15:04'),
(286, 109, 42, 'assignee_removed', '{\"user_id\":\"44\"}', '2025-05-17 09:33:01'),
(287, 110, 42, 'assignee_removed', '{\"user_id\":\"46\"}', '2025-05-17 09:33:13'),
(288, 110, 42, 'assignee_removed', '{\"user_id\":\"44\"}', '2025-05-17 09:33:15'),
(289, 109, 42, 'assignee_removed', '{\"user_id\":\"41\"}', '2025-05-17 09:33:22'),
(290, 112, 42, 'assignee_removed', '{\"user_id\":\"43\"}', '2025-05-17 09:42:23'),
(291, 115, 42, 'assignee_removed', '{\"user_id\":\"46\"}', '2025-05-17 09:42:26'),
(292, 115, 42, 'assignee_removed', '{\"user_id\":\"44\"}', '2025-05-17 09:42:27'),
(293, 115, 42, 'assignee_removed', '{\"user_id\":\"43\"}', '2025-05-17 09:42:28'),
(294, 106, 42, 'assignee_added', '{\"user_id\":41}', '2025-05-17 09:42:35'),
(295, 112, 42, 'assignee_added', '{\"user_id\":40}', '2025-05-17 09:44:48'),
(296, 99, 42, 'assignee_added', '{\"user_id\":40}', '2025-05-17 13:37:32'),
(297, 109, 42, 'assignee_removed', '{\"user_id\":\"46\"}', '2025-05-17 13:56:04'),
(298, 109, 42, 'assignee_added', '{\"user_id\":44}', '2025-05-17 13:56:06'),
(299, 109, 42, 'assignee_removed', '{\"user_id\":\"44\"}', '2025-05-17 13:56:09'),
(300, 98, 42, 'assignee_added', '{\"user_id\":40}', '2025-05-17 15:13:11'),
(301, 103, 42, 'assignee_removed', '{\"user_id\":\"46\"}', '2025-05-17 15:13:23'),
(302, 103, 42, 'assignee_removed', '{\"user_id\":\"43\"}', '2025-05-17 15:13:25'),
(303, 114, 42, 'comment_added', NULL, '2025-05-17 15:30:41'),
(304, 96, 42, 'priority_updated', '{\"old_priority\":\"low\",\"new_priority\":\"medium\"}', '2025-05-17 15:48:44'),
(305, 96, 42, 'priority_updated', '{\"old_priority\":\"medium\",\"new_priority\":\"high\"}', '2025-05-17 15:48:46'),
(306, 96, 42, 'priority_updated', '{\"old_priority\":\"high\",\"new_priority\":\"low\"}', '2025-05-17 15:48:49'),
(307, 96, 42, 'priority_updated', '{\"old_priority\":\"low\",\"new_priority\":\"high\"}', '2025-05-17 15:48:51'),
(308, 109, 42, 'assignee_removed', '{\"user_id\":\"43\"}', '2025-05-17 19:43:08'),
(309, 109, 42, 'assignee_added', '{\"user_id\":41}', '2025-05-17 19:43:11'),
(310, 109, 42, 'priority_updated', '{\"old_priority\":\"low\",\"new_priority\":\"medium\"}', '2025-05-17 19:43:13'),
(311, 109, 42, 'link_added', '{\"url\":\"http:\\/\\/localhost\\/nexora\\/View\\/facility.php\",\"title\":null}', '2025-05-17 19:43:25'),
(312, 117, 41, 'assignee_added', '{\"user_id\":42}', '2025-05-18 00:42:21'),
(313, 117, 41, 'priority_updated', '{\"old_priority\":\"medium\",\"new_priority\":\"low\"}', '2025-05-18 00:42:32'),
(314, 117, 41, 'status_updated', '{\"old_status\":\"todo\",\"new_status\":\"done\"}', '2025-05-18 00:42:34'),
(315, 119, 42, 'assignee_added', '{\"user_id\":41}', '2025-05-18 01:09:00'),
(316, 119, 42, 'status_updated', '{\"old_status\":\"todo\",\"new_status\":\"done\"}', '2025-05-18 01:09:44'),
(317, 109, 42, 'comment_added', NULL, '2025-05-19 12:07:16'),
(318, 119, 42, 'assignee_added', '{\"user_id\":40}', '2025-05-19 13:45:37'),
(319, 119, 42, 'assignee_removed', '{\"user_id\":\"40\"}', '2025-05-19 13:45:39'),
(320, 119, 42, 'comment_added', NULL, '2025-05-19 13:45:42'),
(321, 120, 41, 'assignee_added', '{\"user_id\":40}', '2025-05-19 14:15:49'),
(322, 121, 41, 'priority_updated', '{\"old_priority\":\"medium\",\"new_priority\":\"low\"}', '2025-05-19 14:26:46'),
(323, 121, 41, 'priority_updated', '{\"old_priority\":\"low\",\"new_priority\":\"medium\"}', '2025-05-19 14:26:47'),
(324, 121, 41, 'comment_added', NULL, '2025-05-19 14:26:55'),
(325, 121, 41, 'file_uploaded', '{\"file_name\":\"Employee handbook brochure2.pdf\",\"file_size\":299126}', '2025-05-19 14:27:03'),
(326, 121, 41, 'link_added', '{\"url\":\"http:\\/\\/localhost\\/nexora\\/View\\/facility.php\",\"title\":null}', '2025-05-19 14:27:07'),
(327, 109, 41, 'file_uploaded', '{\"file_name\":\"CONTRACT OF REGULAR EMPLOYEES.pdf\",\"file_size\":119894}', '2025-05-19 14:27:39'),
(328, 98, 42, 'priority_updated', '{\"old_priority\":\"high\",\"new_priority\":\"medium\"}', '2025-05-19 14:32:46'),
(329, 98, 42, 'priority_updated', '{\"old_priority\":\"medium\",\"new_priority\":\"low\"}', '2025-05-19 14:32:46'),
(330, 98, 42, 'priority_updated', '{\"old_priority\":\"low\",\"new_priority\":\"medium\"}', '2025-05-19 14:32:47'),
(331, 98, 42, 'priority_updated', '{\"old_priority\":\"medium\",\"new_priority\":\"low\"}', '2025-05-19 14:32:51'),
(332, 98, 42, 'priority_updated', '{\"old_priority\":\"low\",\"new_priority\":\"medium\"}', '2025-05-19 14:32:52'),
(333, 102, 42, 'file_uploaded', '{\"file_name\":\"Employee Handbook-1.doc\",\"file_size\":251904}', '2025-05-19 14:35:13'),
(334, 120, 41, 'assignee_added', '{\"user_id\":42}', '2025-05-19 15:11:11'),
(335, 120, 41, 'assignee_removed', '{\"user_id\":\"40\"}', '2025-05-19 15:11:11'),
(336, 121, 41, 'priority_updated', '{\"old_priority\":\"medium\",\"new_priority\":\"low\"}', '2025-05-19 15:12:24'),
(337, 121, 41, 'priority_updated', '{\"old_priority\":\"low\",\"new_priority\":\"medium\"}', '2025-05-19 15:12:25'),
(338, 121, 41, 'comment_added', NULL, '2025-05-19 15:12:32'),
(339, 126, 41, 'priority_updated', '{\"old_priority\":\"medium\",\"new_priority\":\"low\"}', '2025-05-19 15:29:07'),
(340, 126, 41, 'priority_updated', '{\"old_priority\":\"low\",\"new_priority\":\"medium\"}', '2025-05-19 15:29:09'),
(341, 126, 41, 'file_uploaded', '{\"file_name\":\"Employee handbook brochure2.pdf\",\"file_size\":299126}', '2025-05-19 15:29:14'),
(342, 126, 41, 'link_added', '{\"url\":\"https:\\/\\/www.facebook.com\\/TMtambayan\\/\",\"title\":null}', '2025-05-19 15:29:21'),
(343, 126, 41, 'comment_added', NULL, '2025-05-19 15:29:30'),
(344, 120, 42, 'file_uploaded', '{\"file_name\":\"CONTRACT OF REGULAR EMPLOYEES.docx\",\"file_size\":22813}', '2025-05-19 15:35:27'),
(345, 109, 42, 'priority_updated', '{\"old_priority\":\"medium\",\"new_priority\":\"low\"}', '2025-05-19 16:45:25'),
(346, 109, 42, 'priority_updated', '{\"old_priority\":\"low\",\"new_priority\":\"medium\"}', '2025-05-19 16:45:26'),
(347, 109, 42, 'status_updated', '{\"old_status\":\"progress\",\"new_status\":\"done\"}', '2025-05-19 16:52:24'),
(348, 109, 42, 'status_updated', '{\"old_status\":\"done\",\"new_status\":\"progress\"}', '2025-05-19 16:52:26'),
(349, 120, 42, 'file_uploaded', '{\"file_name\":\"CONTRACT FOR PROBATIONARY EMPLOYEES.pdf\",\"file_size\":150089}', '2025-05-19 16:53:15'),
(350, 119, 42, 'assignee_added', '{\"user_id\":43}', '2025-05-19 17:04:36'),
(351, 119, 42, 'assignee_removed', '{\"user_id\":\"43\"}', '2025-05-19 17:04:37'),
(352, 119, 42, 'assignee_added', '{\"user_id\":44}', '2025-05-19 17:04:39'),
(353, 119, 42, 'assignee_removed', '{\"user_id\":\"44\"}', '2025-05-19 17:04:40'),
(354, 119, 42, 'comment_added', NULL, '2025-05-19 17:04:53'),
(355, 119, 42, 'file_uploaded', '{\"file_name\":\"CONTRACT OF REGULAR EMPLOYEES.pdf\",\"file_size\":119894}', '2025-05-19 17:04:58'),
(356, 120, 41, 'comment_added', NULL, '2025-05-19 17:09:58'),
(357, 109, 42, 'assignee_removed', '{\"user_id\":\"41\"}', '2025-05-19 17:22:13'),
(358, 109, 42, 'assignee_added', '{\"user_id\":43}', '2025-05-19 17:22:17'),
(359, 109, 42, 'assignee_added', '{\"user_id\":46}', '2025-05-19 17:51:16'),
(360, 109, 42, 'assignee_removed', '{\"user_id\":\"46\"}', '2025-05-19 17:51:17'),
(361, 109, 42, 'comment_added', NULL, '2025-05-19 17:58:03'),
(362, 119, 42, 'assignee_added', '{\"user_id\":43}', '2025-05-19 18:43:26'),
(363, 119, 42, 'assignee_added', '{\"user_id\":44}', '2025-05-20 05:04:05'),
(364, 120, 42, 'comment_added', NULL, '2025-05-20 05:12:09'),
(365, 120, 42, 'comment_added', NULL, '2025-05-20 05:17:44'),
(366, 120, 42, 'file_uploaded', '{\"file_name\":\"PRE-EMPLOYMENT ORIENTATION SEMINAR.pdf\",\"file_size\":27153}', '2025-05-20 05:17:56'),
(367, 119, 42, 'assignee_added', '{\"user_id\":46}', '2025-05-20 05:22:39'),
(368, 119, 42, 'assignee_removed', '{\"user_id\":44}', '2025-05-20 05:22:46'),
(369, 119, 42, 'file_uploaded', '{\"file_name\":\"PRE-EMPLOYMENT ORIENTATION SEMINAR.pdf\",\"file_size\":27153}', '2025-05-20 05:23:26'),
(370, 119, 42, 'comment_added', NULL, '2025-05-20 05:32:08'),
(371, 128, 42, 'assignee_added', '{\"user_id\":40}', '2025-05-20 05:33:27'),
(372, 119, 42, 'comment_added', NULL, '2025-05-20 05:48:27'),
(373, 130, 42, 'assignee_added', '{\"user_id\":41}', '2025-05-20 05:49:37'),
(374, 132, 42, 'assignee_added', '{\"user_id\":41}', '2025-05-20 06:06:49'),
(375, 127, 42, 'comment_added', NULL, '2025-05-20 06:17:19'),
(376, 127, 42, 'file_uploaded', '{\"file_name\":\"GENERAL OBJECTIVES SYSTEM.docx\",\"file_size\":15535}', '2025-05-20 06:17:33'),
(377, 127, 42, 'file_uploaded', '{\"file_name\":\"485792175_625255977053335_2578855129816868084_n.jpg\",\"file_size\":327463}', '2025-05-20 06:25:47'),
(378, 132, 42, 'assignee_added', '{\"user_id\":44}', '2025-05-20 06:49:13'),
(379, 132, 42, 'comment_added', NULL, '2025-05-20 06:49:33'),
(380, 132, 42, 'assignee_added', '{\"user_id\":40}', '2025-05-20 06:49:42'),
(381, 132, 42, 'comment_added', NULL, '2025-05-20 07:00:32'),
(382, 132, 42, 'assignee_added', '{\"user_id\":43}', '2025-05-20 07:00:43'),
(383, 132, 42, 'assignee_removed', '{\"user_id\":44}', '2025-05-20 07:00:46'),
(384, 132, 42, 'assignee_removed', '{\"user_id\":43}', '2025-05-20 07:00:48'),
(385, 127, 42, 'file_uploaded', '{\"file_name\":\"COVER PAGE.pdf\",\"file_size\":105924}', '2025-05-20 07:01:23'),
(386, 130, 42, 'comment_added', NULL, '2025-05-20 07:01:45'),
(387, 133, 42, 'comment_added', NULL, '2025-05-20 07:05:02'),
(388, 133, 42, 'assignee_added', '{\"user_id\":41}', '2025-05-20 07:05:06'),
(389, 134, 42, 'assignee_added', '{\"user_id\":43}', '2025-05-20 07:18:59'),
(390, 134, 42, 'assignee_added', '{\"user_id\":41}', '2025-05-20 07:32:33'),
(391, 134, 42, 'comment_added', NULL, '2025-05-20 07:42:32'),
(392, 137, 42, 'assignee_added', '{\"user_id\":41}', '2025-05-20 07:46:50'),
(393, 127, 42, 'comment_added', NULL, '2025-05-20 07:53:15'),
(394, 127, 42, 'comment_added', NULL, '2025-05-20 07:53:20'),
(395, 120, 42, 'comment_added', NULL, '2025-05-20 08:04:27'),
(396, 128, 42, 'file_uploaded', '{\"file_name\":\"PRE-EMPLOYMENT ORIENTATION SEMINAR.pdf\",\"file_size\":27153}', '2025-05-20 08:04:47'),
(397, 128, 42, 'comment_added', NULL, '2025-05-20 08:04:57'),
(398, 134, 42, 'comment_added', NULL, '2025-05-20 08:16:38'),
(399, 119, 42, 'assignee_removed', '{\"user_id\":41}', '2025-05-20 08:45:08'),
(400, 119, 42, 'assignee_removed', '{\"user_id\":43}', '2025-05-20 08:45:08'),
(401, 119, 42, 'assignee_removed', '{\"user_id\":46}', '2025-05-20 08:45:09'),
(402, 141, 42, 'assignee_added', '{\"user_id\":44}', '2025-05-20 08:45:47'),
(403, 131, 42, 'comment_added', NULL, '2025-05-20 09:57:43'),
(404, 131, 42, 'comment_added', NULL, '2025-05-20 09:59:02'),
(405, 145, 41, 'assignee_added', '{\"user_id\":42}', '2025-05-20 11:11:22'),
(406, 145, 41, 'assignee_added', '{\"user_id\":40}', '2025-05-20 11:11:24'),
(407, 145, 41, 'assignee_removed', '{\"user_id\":42}', '2025-05-20 11:11:26'),
(408, 145, 41, 'assignee_removed', '{\"user_id\":40}', '2025-05-20 11:11:27'),
(409, 145, 41, 'assignee_added', '{\"user_id\":42}', '2025-05-20 11:11:29'),
(410, 145, 41, 'assignee_added', '{\"user_id\":40}', '2025-05-20 11:11:32'),
(411, 103, 41, 'comment_added', NULL, '2025-05-20 11:13:01'),
(412, 144, 42, 'comment_added', NULL, '2025-05-20 11:17:37'),
(413, 144, 42, 'file_uploaded', '{\"file_name\":\"4283bc95771e3cb1372d537a2c9fa9a1.jpg\",\"file_size\":111072}', '2025-05-20 11:17:47'),
(414, 103, 41, 'comment_added', NULL, '2025-05-20 11:23:42'),
(415, 144, 42, 'assignee_added', '{\"user_id\":40}', '2025-05-20 11:30:45'),
(416, 145, 42, 'comment_added', NULL, '2025-05-20 11:31:21'),
(417, 147, 48, 'comment_added', NULL, '2025-05-20 12:39:44'),
(418, 147, 48, 'file_uploaded', '{\"file_name\":\"471763516_1499031758151863_5981848480296269758_n.jpg\",\"file_size\":397488}', '2025-05-20 12:39:58'),
(419, 147, 48, 'assignee_added', '{\"user_id\":41}', '2025-05-20 12:42:48'),
(420, 147, 48, 'assignee_added', '{\"user_id\":42}', '2025-05-20 12:42:57');

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
(5, 103, 40, '2025-05-16 10:05:58'),
(6, 103, 44, '2025-05-16 10:07:20'),
(8, 103, 41, '2025-05-16 10:07:39'),
(10, 109, 40, '2025-05-16 12:12:41'),
(15, 110, 40, '2025-05-16 12:27:37'),
(24, 115, 41, '2025-05-16 12:36:04'),
(25, 115, 40, '2025-05-16 12:36:07'),
(26, 112, 41, '2025-05-16 12:36:28'),
(27, 102, 44, '2025-05-16 12:36:31'),
(28, 102, 41, '2025-05-16 12:36:33'),
(29, 113, 40, '2025-05-16 12:36:36'),
(32, 96, 43, '2025-05-16 12:36:44'),
(33, 96, 40, '2025-05-16 12:36:44'),
(36, 107, 44, '2025-05-16 12:36:53'),
(37, 107, 40, '2025-05-16 12:36:53'),
(39, 114, 46, '2025-05-16 12:36:59'),
(40, 114, 41, '2025-05-16 12:37:01'),
(41, 104, 41, '2025-05-16 12:39:19'),
(42, 104, 46, '2025-05-16 12:39:21'),
(44, 100, 40, '2025-05-17 00:26:53'),
(45, 110, 41, '2025-05-17 09:12:18'),
(46, 110, 43, '2025-05-17 09:12:41'),
(48, 106, 41, '2025-05-17 09:42:35'),
(49, 112, 40, '2025-05-17 09:44:48'),
(50, 99, 40, '2025-05-17 13:37:32'),
(52, 98, 40, '2025-05-17 15:13:11'),
(54, 117, 42, '2025-05-18 00:42:21'),
(58, 120, 42, '2025-05-19 15:11:11'),
(61, 109, 43, '2025-05-19 17:22:17'),
(66, 128, 40, '2025-05-20 05:33:27'),
(67, 130, 41, '2025-05-20 05:49:37'),
(68, 132, 41, '2025-05-20 06:06:49'),
(70, 132, 40, '2025-05-20 06:49:42'),
(72, 133, 41, '2025-05-20 07:05:06'),
(73, 134, 43, '2025-05-20 07:18:59'),
(74, 134, 41, '2025-05-20 07:32:33'),
(75, 137, 41, '2025-05-20 07:46:50'),
(76, 141, 44, '2025-05-20 08:45:47'),
(79, 145, 42, '2025-05-20 11:11:29'),
(80, 145, 40, '2025-05-20 11:11:32'),
(81, 144, 40, '2025-05-20 11:30:45'),
(82, 147, 41, '2025-05-20 12:42:48'),
(83, 147, 42, '2025-05-20 12:42:57');

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

--
-- Dumping data for table `task_attachments`
--

INSERT INTO `task_attachments` (`id`, `task_id`, `uploaded_by`, `file_name`, `file_path`, `file_size`, `file_type`, `uploaded_at`) VALUES
(4, 103, 42, 'TEAM NEXORA - SURVEY RESEARCH.docx', 'uploads/tasks/task_6826f17fab44a.docx', 49302, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '2025-05-16 08:04:15'),
(5, 103, 42, 'circuit_image.png', 'uploads/tasks/task_103_6826f75471dce.png', 1405060, 'image/png', '2025-05-16 08:29:08'),
(6, 103, 42, 'Screenshot 2025-04-28 163654.png', 'uploads/tasks/task_103_6826f806110bf.png', 146398, 'image/png', '2025-05-16 08:32:06'),
(8, 103, 42, 'Operations Memo.docx', 'uploads/tasks/task_103_6826f9a988fbe.docx', 70223, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '2025-05-16 08:39:05'),
(10, 109, 42, 'PRODUCT INVENTORY.docx', 'uploads/tasks/task_109_68272cf2643da.docx', 217552, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '2025-05-16 12:17:54'),
(11, 109, 42, 'Operations Memo.docx', 'uploads/tasks/task_109_68272d03b3b7c.docx', 70223, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '2025-05-16 12:18:11'),
(19, 120, 42, 'CONTRACT FOR PROBATIONARY EMPLOYEES.pdf', 'uploads/tasks/task_120_682b61fb05d3a.pdf', 150089, 'application/pdf', '2025-05-19 16:53:15'),
(23, 127, 42, 'GENERAL OBJECTIVES SYSTEM.docx', 'uploads/tasks/task_127_682c1e7d71f96.docx', 15535, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '2025-05-20 06:17:33'),
(24, 127, 42, '485792175_625255977053335_2578855129816868084_n.jpg', 'uploads/tasks/task_127_682c206bd1761.jpg', 327463, 'image/jpeg', '2025-05-20 06:25:47'),
(25, 127, 42, 'COVER PAGE.pdf', 'uploads/tasks/task_127_682c28c386145.pdf', 105924, 'application/pdf', '2025-05-20 07:01:23'),
(26, 128, 42, 'PRE-EMPLOYMENT ORIENTATION SEMINAR.pdf', 'uploads/tasks/task_128_682c379f945cb.pdf', 27153, 'application/pdf', '2025-05-20 08:04:47'),
(27, 144, 42, '4283bc95771e3cb1372d537a2c9fa9a1.jpg', 'uploads/tasks/task_144_682c64db3dad9.jpg', 111072, 'image/jpeg', '2025-05-20 11:17:47'),
(28, 147, 48, '471763516_1499031758151863_5981848480296269758_n.jpg', 'uploads/tasks/task_147_682c781ebfe81.jpg', 397488, 'image/jpeg', '2025-05-20 12:39:58');

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

--
-- Dumping data for table `task_comments`
--

INSERT INTO `task_comments` (`id`, `task_id`, `user_id`, `content`, `created_at`, `updated_at`) VALUES
(42, 99, 42, 'aerer', '2025-05-12 08:45:03', '2025-05-12 08:45:03'),
(43, 101, 42, 'ZAETFRTY', '2025-05-12 08:51:22', '2025-05-12 08:51:22'),
(44, 96, 42, 'SDFSD', '2025-05-12 09:46:50', '2025-05-12 09:46:50'),
(45, 96, 42, 'YUHJIHJ', '2025-05-12 09:46:52', '2025-05-12 09:46:52'),
(46, 102, 42, 'EQR', '2025-05-12 10:02:19', '2025-05-12 10:02:19'),
(47, 102, 42, 'HJY', '2025-05-12 10:02:21', '2025-05-12 10:02:21'),
(48, 102, 42, 'HG', '2025-05-12 10:02:23', '2025-05-12 10:02:23'),
(49, 105, 42, 'XGT', '2025-05-12 10:08:16', '2025-05-12 10:08:16'),
(50, 105, 42, 'GH', '2025-05-12 10:08:17', '2025-05-12 10:08:17'),
(51, 105, 42, 'XXJCN', '2025-05-12 10:25:15', '2025-05-12 10:25:15'),
(52, 103, 42, 'SFGDF', '2025-05-12 13:50:28', '2025-05-12 13:50:28'),
(53, 103, 42, 'FDHXDGTH', '2025-05-12 15:50:18', '2025-05-12 15:50:18'),
(54, 106, 42, 'DGTYH', '2025-05-12 15:59:22', '2025-05-12 15:59:22'),
(55, 100, 42, 'SDGSERF', '2025-05-12 16:00:54', '2025-05-12 16:00:54'),
(56, 103, 42, 'HGJCGH', '2025-05-12 19:15:11', '2025-05-12 19:15:11'),
(57, 107, 42, 'fsg', '2025-05-16 04:09:17', '2025-05-16 04:09:17'),
(58, 103, 42, 'irduhfgfd', '2025-05-16 07:28:09', '2025-05-16 07:28:09'),
(59, 108, 43, 'rtgr', '2025-05-16 07:37:21', '2025-05-16 07:37:21'),
(60, 115, 42, 'fdkuh', '2025-05-17 09:01:39', '2025-05-17 09:01:39'),
(61, 114, 42, 'GGHG', '2025-05-17 15:30:41', '2025-05-17 15:30:41'),
(62, 109, 42, 'rg', '2025-05-19 12:07:16', '2025-05-19 12:07:16'),
(64, 121, 41, 'RFHFFRG', '2025-05-19 14:26:55', '2025-05-19 14:26:55'),
(65, 121, 41, 'RETFE', '2025-05-19 15:12:32', '2025-05-19 15:12:32'),
(66, 126, 41, 'RFGHXFTG', '2025-05-19 15:29:30', '2025-05-19 15:29:30'),
(68, 120, 41, 'RFHDETF', '2025-05-19 17:09:58', '2025-05-19 17:09:58'),
(69, 109, 42, 'dfhfg', '2025-05-19 17:58:03', '2025-05-19 17:58:03'),
(70, 120, 42, 'BFKG', '2025-05-20 05:12:09', '2025-05-20 05:12:09'),
(71, 120, 42, 'fkbjfd', '2025-05-20 05:17:44', '2025-05-20 05:17:44'),
(74, 127, 42, 'EBRKBTJ', '2025-05-20 06:17:19', '2025-05-20 06:17:19'),
(80, 127, 42, 'UIRHTSUR', '2025-05-20 07:53:15', '2025-05-20 07:53:15'),
(81, 127, 42, 'YWEJFGIUR', '2025-05-20 07:53:20', '2025-05-20 07:53:20'),
(82, 120, 42, 'UIRURHGRUI', '2025-05-20 08:04:27', '2025-05-20 08:04:27'),
(83, 128, 42, 'FHBGFGD', '2025-05-20 08:04:57', '2025-05-20 08:04:57'),
(85, 131, 42, 'fbjvgsrkg', '2025-05-20 09:57:43', '2025-05-20 09:57:43'),
(86, 131, 42, 'gfufhfgigjhlg', '2025-05-20 09:59:02', '2025-05-20 09:59:02'),
(87, 103, 41, 'jondggf', '2025-05-20 11:13:01', '2025-05-20 11:13:01'),
(88, 144, 42, 'yuawrgeuibt\\', '2025-05-20 11:17:37', '2025-05-20 11:17:37'),
(89, 103, 41, 'AMAMAMAMMAMAMAMA', '2025-05-20 11:23:42', '2025-05-20 11:23:42'),
(90, 145, 42, 'kjdfndxf', '2025-05-20 11:31:21', '2025-05-20 11:31:21'),
(91, 147, 48, 'RHYTBRTKJ', '2025-05-20 12:39:44', '2025-05-20 12:39:44');

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

--
-- Dumping data for table `task_links`
--

INSERT INTO `task_links` (`id`, `task_id`, `url`, `created_by`, `created_at`) VALUES
(7, 100, 'http://localhost/nexora/View/facility.php', 42, '2025-05-12 09:58:31'),
(9, 107, 'https://docs.google.com/forms/d/1gYL4-ELtZh9hEq5pKOxfJHfwXrVfG7c87zUlYHlGZ4k/edit?pli=1#responses', 42, '2025-05-16 04:09:30'),
(10, 103, 'https://docs.google.com/forms/d/1gYL4-ELtZh9hEq5pKOxfJHfwXrVfG7c87zUlYHlGZ4k/edit?pli=1#responses', 42, '2025-05-16 04:25:15'),
(11, 103, 'https://docs.google.com/spreadsheets/d/1Mwc-1RKR7g283yL3kKwBMJ7cxKz0HZyFPahsyjuCegE/edit?pli=1&gid=769231142#gid=769231142', 42, '2025-05-16 08:08:02'),
(12, 103, 'https://www.facebook.com/TMtambayan/', 42, '2025-05-16 08:51:03'),
(13, 103, 'https://www.fdh.co.mw/fdhfinancialholdings', 42, '2025-05-16 08:54:39'),
(14, 103, 'https://www.toolify.ai/alternative/videmak-research-ai', 42, '2025-05-16 09:06:41'),
(15, 103, 'http://localhost/nexora/View/facility.php', 42, '2025-05-16 09:35:44'),
(21, 121, 'http://localhost/nexora/View/facility.php', 41, '2025-05-19 14:27:07'),
(24, 109, 'https://www.facebook.com/TMtambayan/', 42, '2025-05-19 17:22:27'),
(26, 128, 'https://docs.google.com/forms/d/1gYL4-ELtZh9hEq5pKOxfJHfwXrVfG7c87zUlYHlGZ4k/edit?pli=1#responses', 42, '2025-05-20 08:04:52');

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
(48, 'Riley Melton', 'gini@mailinator.com', '$2y$10$NXeELfUSj6ZPJFWjQ9pGpe/dhrWVfx.iALv.IiXlPj4RJeAu6XGWy', '2025-05-20 12:27:55', '2025-05-20 12:40:37', 'Images/profile.PNG', 35);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `facility_admins`
--
ALTER TABLE `facility_admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT for table `facility_invitations`
--
ALTER TABLE `facility_invitations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `facility_members`
--
ALTER TABLE `facility_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=252;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=148;

--
-- AUTO_INCREMENT for table `task_activities`
--
ALTER TABLE `task_activities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=421;

--
-- AUTO_INCREMENT for table `task_assignments`
--
ALTER TABLE `task_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=84;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

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
