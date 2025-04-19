-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 19, 2025 at 11:31 AM
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
(2, 'Thomas Willis\'s Facility', 'M9SJR1ES', 15, '2025-04-19 06:35:14', '2025-04-19 06:35:14'),
(3, 'Sylvia Levine\'s Facility', 'YJ5FY4YZ', 16, '2025-04-19 06:35:19', '2025-04-19 06:35:19'),
(4, 'Jessamine Bridges\'s Facility', 'CTFEBU8G', 17, '2025-04-19 06:35:24', '2025-04-19 06:35:24'),
(5, 'Kelsey Fletcher\'s Facility', 'IW670GKG', 18, '2025-04-19 06:35:28', '2025-04-19 06:35:28'),
(8, 'Ross Shelton\'s Facility', 'DWAGYNZ2', 21, '2025-04-19 09:17:10', '2025-04-19 09:17:10');

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
(2, 2, 15, 15, '2025-04-19 06:35:14'),
(3, 3, 16, 16, '2025-04-19 06:35:19'),
(4, 4, 17, 17, '2025-04-19 06:35:24'),
(5, 5, 18, 18, '2025-04-19 06:35:28'),
(6, 8, 21, 21, '2025-04-19 09:17:10');

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
(2, 2, 15, '2025-04-19 06:35:14'),
(3, 3, 16, '2025-04-19 06:35:19'),
(4, 4, 17, '2025-04-19 06:35:24'),
(5, 5, 18, '2025-04-19 06:35:28'),
(6, 8, 21, '2025-04-19 09:17:10');

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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `name`, `description`, `priority`, `due_date`, `color`, `status`, `owner_id`, `created_at`) VALUES
(133, 'Indigo Gray', 'Odit consectetur au', 'medium', '2025-12-12', '#b304a8', 'todo', 15, '2025-04-19 06:45:13'),
(134, 'Gemma Abbott', 'Similique elit saep', 'medium', '2025-04-26', '#90e462', 'todo', 15, '2025-04-19 06:45:17'),
(135, 'Lewis Boyle', 'Aut sed vero delenit', 'high', '2025-04-26', '#b2e1d9', 'todo', 15, '2025-04-19 06:45:22'),
(136, 'Rhona Drake', 'Quasi voluptatibus n', 'low', '2025-04-26', '#60642f', 'todo', 15, '2025-04-19 06:45:25');

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
  `profile_picture` varchar(255) DEFAULT 'Images/profile.PNG'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `created_at`, `updated_at`, `profile_picture`) VALUES
(15, 'Elmer Rapon', 'raponelmer15@gmail.com', '$2y$10$e45iA6LSEvOec0tXE/pdzea9yzI/8NYwR2eQQninkyHGnzBjJEsnK', '2025-04-19 06:35:14', '2025-04-19 06:45:36', 'uploads/profile_pictures/user_15_1745045005.jpg'),
(16, 'Sylvia Levine', 'zuqel@mailinator.com', '$2y$10$sDMdUSnxQl9DlEDMzu1FaOxR.z.3CWM9o9e7vsJUjsu.fely1g0m6', '2025-04-19 06:35:19', '2025-04-19 06:35:19', 'Images/profile.PNG'),
(17, 'Jessamine Bridges', 'wybupebuw@mailinator.com', '$2y$10$azjFWjBXFL4cTLQzmtyIFO89In8SUl7EUWd2/NJmpNLzj0euAFcPG', '2025-04-19 06:35:24', '2025-04-19 06:35:24', 'Images/profile.PNG'),
(18, 'Kelsey Fletcher', 'fakid@mailinator.com', '$2y$10$2PmRd8YXSj66ety0gnIXmuhWcMZVUcoEAAGW26iWVzpicDFLcAGzC', '2025-04-19 06:35:28', '2025-04-19 06:35:28', 'Images/profile.PNG'),
(21, 'Ross Shelton', 'tewiw@mailinator.com', '$2y$10$2IsJg4tra0CDuZLeTN8PHOLJqfdO/.av3ylQwMAQ8lkqE8yz1a/eO', '2025-04-19 09:17:10', '2025-04-19 09:17:10', 'Images/profile.PNG');

--
-- Indexes for dumped tables
--

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
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `facilities`
--
ALTER TABLE `facilities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `facility_admins`
--
ALTER TABLE `facility_admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `facility_invitations`
--
ALTER TABLE `facility_invitations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `facility_members`
--
ALTER TABLE `facility_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=137;

--
-- AUTO_INCREMENT for table `security_questions`
--
ALTER TABLE `security_questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- Constraints for dumped tables
--

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
-- Constraints for table `security_questions`
--
ALTER TABLE `security_questions`
  ADD CONSTRAINT `security_questions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
