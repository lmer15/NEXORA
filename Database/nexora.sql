-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 27, 2025 at 08:10 PM
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
(29, 'Rafael Guy\'s Facility', 'ERTS-J4VZ', 42, '2025-04-25 06:48:31', '2025-04-26 10:52:18'),
(30, 'Rosalyn Harmon\'s Facility', 'JEWD8OI7', 43, '2025-04-25 09:34:49', '2025-04-27 02:11:10'),
(31, 'Mechelle Rutledge\'s Facility', 'ZSHJGEDE', 44, '2025-04-25 09:37:42', '2025-04-26 07:41:12'),
(32, 'Rhoda Christensen\'s Facility', 'BR1IVN5U', 45, '2025-04-26 11:04:13', '2025-04-26 11:04:13');

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
(21, 32, 45, 45, '2025-04-26 11:04:13');

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
(18, 28, 43, '2025-04-26 01:08:41'),
(19, 28, 40, '2025-04-26 04:03:29'),
(20, 28, 42, '2025-04-26 04:03:29'),
(21, 29, 41, '2025-04-26 04:05:45'),
(22, 29, 43, '2025-04-26 06:53:42'),
(25, 31, 41, '2025-04-26 07:18:04'),
(26, 31, 42, '2025-04-26 08:26:31'),
(27, 29, 40, '2025-04-26 10:59:35'),
(28, 32, 45, '2025-04-26 11:04:13'),
(29, 32, 40, '2025-04-26 11:04:46'),
(30, 32, 41, '2025-04-26 11:05:13'),
(31, 31, 45, '2025-04-27 00:24:03'),
(32, 28, 45, '2025-04-27 00:41:47');

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
(142, 'Cheyenne Albert', 'Odit veritatis molli', 'medium', '2025-12-25', '#cf0dde', 'done', 42, '2025-04-25 06:56:59', 0),
(143, 'Otto Cote', 'Quas dolor debitis u', 'medium', '2025-09-25', '#2cbd61', 'todo', 44, '2025-04-25 12:01:50', 0),
(144, 'Griffith Olson', 'Voluptatum cum sed d', 'medium', '2025-11-20', '#9912a0', 'progress', 41, '2025-04-25 13:10:41', 0),
(145, 'Dane Newton', 'Bsomdl;fmlfdk;m;flgtftg', 'low', '2025-05-15', '#da4925', 'progress', 41, '2025-04-25 13:27:03', 0),
(146, 'Oleg Sloan', 'Odio eveniet tempor', 'medium', '2025-05-23', '#49b3d6', 'todo', 43, '2025-04-25 23:25:22', 0),
(147, 'Zelenia Hurley', 'Necessitatibus unde', 'low', '2025-05-04', '#725b45', 'todo', 41, '2025-04-27 14:56:25', 0),
(148, 'Paul Burris', 'Est ullam voluptas i', 'medium', '2025-05-22', '#10b981', 'done', 41, '2025-04-27 15:02:04', 0),
(149, 'Britanney Camacho', 'Ut esse esse deseru', 'medium', '2025-05-04', '#8b5cf6', 'done', 41, '2025-04-27 15:12:04', 0),
(150, 'May Snow', 'Sunt ipsum autem au', 'medium', '2025-06-28', '#8b5cf6', 'todo', 43, '2025-04-27 15:30:49', 0),
(151, 'Quyn King', 'Pariatur Voluptates', 'high', '2025-05-04', '#000000', 'todo', 43, '2025-04-27 15:31:30', 0),
(152, 'Jena Mays', 'Optio dolores est e', 'low', '2025-05-04', '#2d7333', 'todo', 43, '2025-04-27 15:31:45', 0),
(153, 'Iris Espinoza', 'Et enim nostrum doloEt enim nostrum doloEt enim nostrum doloEt enim nostrum doloEt enim nostrum doloEt enim nostrum doloEt enim nostrum doloEt enim nostrum doloEt enim nostrum doloEt enim nostrum doloEt enim nostrum doloEt enim nostrum doloEt enim nostrum doloEt enim nostrum doloEt enim nostrum doloEt enim nostrum doloEt enim nostrum doloEt enim nostrum doloEt enim nostrum doloEt enim nostrum doloEt enim nostrum doloEt enim nostrum doloEt enim nostrum doloEt enim nostrum doloEt enim nostrum doloEt enim nostrum doloEt enim nostrum doloEt enim nostrum doloEt enim nostrum doloEt enim nostrum doloEt enim nostrum doloEt enim nostrum doloEt enim nostrum doloEt enim nostrum doloEt enim nostrum doloEt enim nostrum doloEt enim nostrum doloEt enim nostrum doloEt enim nostrum doloEt enim nostrum doloEt enim nostrum doloEt enim nostrum doloEt enim nostrum doloEt enim nostrum dolo', 'high', '2025-05-04', '#6d90ac', 'todo', 43, '2025-04-27 15:32:38', 0),
(154, 'Ignacia Franco', 'Reprehenderit dolor', 'high', '2025-05-04', '#ef4444', 'todo', 43, '2025-04-27 15:33:07', 0),
(155, 'Renee Simmons', 'Omnis incidunt dolo', 'medium', '2025-07-31', '#87d48b', 'done', 44, '2025-04-27 15:34:11', 0),
(156, 'Vincent Ford', 'Eos accusamus nostru', 'high', '2025-05-04', '#ef4444', 'progress', 44, '2025-04-27 15:34:17', 0),
(157, 'Idona Witt', 'Voluptas et voluptat', 'medium', '2025-06-09', '#d0fb1f', 'progress', 44, '2025-04-27 16:16:42', 0),
(158, 'Kirestin Rich', 'Dolore consequatur i', 'medium', '2025-09-27', '#c52558', 'progress', 40, '2025-04-27 16:52:07', 0),
(159, 'Heather Campbell', 'Doloremque deleniti', 'medium', '2025-05-23', '#1817de', 'done', 40, '2025-04-27 16:53:02', 0),
(160, 'Dean Mills', 'Mollit dicta quibusd', 'medium', '2025-05-05', '#0a8717', 'todo', 40, '2025-04-27 16:53:27', 0),
(161, 'Barry Mosley', 'Ut vel quia aut sit', 'low', '2025-07-17', '#ffffff', 'progress', 40, '2025-04-27 16:57:31', 0),
(162, 'Tara Lynch', 'Dolore quod magni ar', 'low', '2025-05-05', '#8b5cf6', 'todo', 40, '2025-04-27 17:00:08', 0),
(163, 'Jasmine Rivera', 'Et incididunt ullamc', 'low', '2025-05-21', '#10b981', 'todo', 41, '2025-04-27 17:08:38', 0),
(164, 'Whitney Blanchard', 'Optio amet dolorem', 'high', '2025-05-05', '#81e8de', 'todo', 41, '2025-04-27 17:12:37', 0),
(165, 'Boris Brewer', 'Duis laborum Aperia', 'low', '2025-11-19', '#ef4444', 'todo', 41, '2025-04-27 17:25:36', 0),
(166, 'Megan Pace', 'Itaque cillum omnis', 'low', '2025-05-05', '#6f0dc2', 'todo', 41, '2025-04-27 17:25:50', 0),
(167, 'Tatyana Rutledge', 'Dolore natus molesti', 'high', '2025-11-19', '#3b82f6', 'progress', 42, '2025-04-27 17:34:04', 0),
(168, 'Beau Lynch', 'Quaerat delectus no', 'low', '2025-09-26', '#254256', 'todo', 42, '2025-04-27 17:34:50', 0),
(169, 'Tallulah Kirk', 'Harum amet voluptat', 'high', '2025-05-22', '#000000', 'done', 42, '2025-04-27 17:35:47', 0),
(170, 'Caesar Mcintyre', 'Similique voluptatem', 'high', '2025-11-21', '#f59e0b', 'progress', 42, '2025-04-27 17:42:30', 0),
(171, 'Cynthia Mathis', 'Quisquam voluptatem', 'low', '2025-05-05', '#8b5cf6', 'todo', 42, '2025-04-27 17:42:41', 0);

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
(41, 'McKenzie Reilly', 'pomotudofo@mailinator.com', '$2y$10$OCg0Hy8hT6/esUE0stURu.891MqNf6WawzPI/19mwaY86kQhocBEy', '2025-04-25 03:24:14', '2025-04-25 03:24:26', 'Images/profile.PNG', 28),
(42, 'Rafael Guy', 'typuk@mailinator.com', '$2y$10$79AN8f0yA/wfD7Fu4rlNJ.lu2RM8VlT.gOJ1UIuIipz4W/490ZdFi', '2025-04-25 06:48:31', '2025-04-25 06:52:30', 'uploads/profile_pictures/user_42_1745563950.jpg', 29),
(43, 'Rosalyn Harmon', 'dimeto@mailinator.com', '$2y$10$tmRp4fhAUdkWN6L0C3.3yu6KiRI7KWgxm232P.etGSyGCW3GH.FGS', '2025-04-25 09:34:49', '2025-04-25 09:35:00', 'Images/profile.PNG', 30),
(44, 'Mechelle Rutledge', 'kykebe@mailinator.com', '$2y$10$t8pFlZLsBvsn6FPAB56M7uK3ZjC/2dbMaAXWrGFp5fmdfbkTrWt/K', '2025-04-25 09:37:42', '2025-04-25 09:37:51', 'Images/profile.PNG', 31),
(45, 'Rhoda Christensen', 'gona@mailinator.com', '$2y$10$h4omxnZkMkasb3ajpCwAieK4ABMCMXw.5H20Wn8m1.WhAjw9xSmoW', '2025-04-26 11:04:13', '2025-04-26 11:04:26', 'Images/profile.PNG', 32);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `facility_admins`
--
ALTER TABLE `facility_admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `facility_invitations`
--
ALTER TABLE `facility_invitations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `facility_members`
--
ALTER TABLE `facility_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=172;

--
-- AUTO_INCREMENT for table `remember_tokens`
--
ALTER TABLE `remember_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `security_questions`
--
ALTER TABLE `security_questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

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
-- Constraints for table `remember_tokens`
--
ALTER TABLE `remember_tokens`
  ADD CONSTRAINT `remember_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `security_questions`
--
ALTER TABLE `security_questions`
  ADD CONSTRAINT `security_questions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
