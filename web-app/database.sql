-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Apr 05, 2025 at 03:19 PM
-- Server version: 8.0.36
-- PHP Version: 8.2.19

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `traits_pms`
--

-- --------------------------------------------------------

--
-- Table structure for table `cheques`
--

CREATE TABLE `cheques` (
  `cheque_id` int NOT NULL,
  `payment_id` int NOT NULL,
  `cheque_number` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `bank_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `date_issued` date NOT NULL,
  `due_date` date NOT NULL,
  `issued_to` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `issued_by` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `status` enum('pending','cleared','returned') COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leases`
--

CREATE TABLE `leases` (
  `lease_id` int NOT NULL,
  `owner_id` int NOT NULL,
  `property_name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `property_type` enum('Building','Villa','Apartment') COLLATE utf8mb4_general_ci NOT NULL,
  `property_code` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `location` text COLLATE utf8mb4_general_ci,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payable_frequency` enum('Monthly','Quarterly','Half Yearly','Yearly') COLLATE utf8mb4_general_ci NOT NULL,
  `lease_doc_url` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `contract_doc_url` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `additional_doc_url` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `owners`
--

CREATE TABLE `owners` (
  `owner_id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `address` text COLLATE utf8mb4_general_ci,
  `email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `mobile_number` varchar(15) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `eid` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `nationality` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `alternate_contact` varchar(15) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `properties`
--

CREATE TABLE `properties` (
  `property_id` int NOT NULL,
  `lease_id` int NOT NULL,
  `property_code` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `floor_number` int DEFAULT NULL,
  `flat_number` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `flat_type` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `rental_type` enum('Flat','Rooms','Partitions','Multiple Tenancy') COLLATE utf8mb4_general_ci NOT NULL,
  `num_rooms` int DEFAULT '0',
  `num_partitions` int DEFAULT '0',
  `occupancy` json DEFAULT NULL,
  `monthly_rent` decimal(10,2) DEFAULT NULL,
  `annual_rent` decimal(10,2) GENERATED ALWAYS AS ((`monthly_rent` * 12)) STORED,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rent_payments`
--

CREATE TABLE `rent_payments` (
  `payment_id` int NOT NULL,
  `assignment_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_date` date NOT NULL,
  `due_date` date NOT NULL,
  `status` enum('pending','collected','approved') COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `collected_at` timestamp NULL DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tenants`
--

CREATE TABLE `tenants` (
  `tenant_id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `fathers_name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `mobile_number` varchar(15) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `nationality` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_general_ci,
  `passport_number` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `eid_number` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `reference_number` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `alternate_mobile` varchar(15) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `workplace` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `designation` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` enum('unassigned','active','vacated') COLLATE utf8mb4_general_ci DEFAULT 'unassigned',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tenant_assignments`
--

CREATE TABLE `tenant_assignments` (
  `assignment_id` int NOT NULL,
  `tenant_id` int NOT NULL,
  `property_id` int NOT NULL,
  `tenant_code` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `monthly_rent` decimal(10,2) NOT NULL,
  `annual_rent` decimal(10,2) GENERATED ALWAYS AS ((`monthly_rent` * 12)) STORED,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `tenant_assignments`
--
DELIMITER $$
CREATE TRIGGER `after_assignment_insert` AFTER INSERT ON `tenant_assignments` FOR EACH ROW BEGIN
    UPDATE tenants SET status = 'active' WHERE tenant_id = NEW.tenant_id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_property_occupancy` AFTER INSERT ON `tenant_assignments` FOR EACH ROW BEGIN
    DECLARE rental_type ENUM('Flat', 'Rooms', 'Partitions', 'Multiple Tenancy');
    DECLARE flat_code VARCHAR(20);
    DECLARE room_code VARCHAR(20);

    SELECT rental_type, CONCAT(property_code, 'F', flat_number) INTO rental_type, flat_code
    FROM properties WHERE property_id = NEW.property_id;

    IF rental_type = 'Flat' THEN
        UPDATE properties SET occupancy = JSON_SET('{}', '$."', flat_code, '"', 1)
        WHERE property_id = NEW.property_id;
    ELSEIF rental_type IN ('Rooms', 'Partitions') THEN
        SET room_code = SUBSTRING(NEW.tenant_code, 1, LENGTH(NEW.tenant_code) - 2);
        UPDATE properties SET occupancy = JSON_SET(COALESCE(occupancy, '{}'), '$."', room_code, '"', 1)
        WHERE property_id = NEW.property_id;
    ELSEIF rental_type = 'Multiple Tenancy' THEN
        SET room_code = SUBSTRING(NEW.tenant_code, 1, LENGTH(NEW.tenant_code) - 2);
        UPDATE properties SET occupancy = JSON_SET(COALESCE(occupancy, '{}'), '$."', room_code, '"', JSON_EXTRACT(occupancy, '$."', room_code, '"') + 1)
        WHERE property_id = NEW.property_id;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `mobile_number` varchar(15) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `role` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `access` json DEFAULT NULL,
  `rights` enum('read_only','read_write') COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `password`, `mobile_number`, `role`, `access`, `rights`, `created_at`) VALUES
(1, 'superadmin', '$2y$10$K8Qz5z5z5z5z5z5z5z5z5u5z5z5z5z5z5z5z5z5z5z5z5z5z5z5z5', '1234567890', 'SuperAdmin', '{\"Rent\": [\"Assigning\", \"Collection list\", \"Rent Entry\", \"View\", \"Collection Entries\", \"Collection Approvals\"], \"Admin\": [], \"Lease\": [\"Create\", \"View\"], \"Cheque\": [\"Cheque Entry\", \"View\"], \"Report\": [\"Owner Report\", \"Lease Report\", \"Property Report\", \"Tenant Report\", \"Rent Report\", \"Expense Report\", \"Service Report\", \"P&L Report\"], \"Tenant\": [\"Create\", \"View\"], \"Expense\": [\"Expense Entry\", \"View\"], \"Service\": [\"Create\", \"View\"], \"Vendors\": [\"Create\", \"View\"], \"Property\": [\"Create\", \"View\"]}', 'read_write', '2025-04-05 10:19:03');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cheques`
--
ALTER TABLE `cheques`
  ADD PRIMARY KEY (`cheque_id`),
  ADD UNIQUE KEY `unique_cheque_number` (`cheque_number`),
  ADD KEY `payment_id` (`payment_id`);

--
-- Indexes for table `leases`
--
ALTER TABLE `leases`
  ADD PRIMARY KEY (`lease_id`),
  ADD UNIQUE KEY `property_code` (`property_code`),
  ADD KEY `owner_id` (`owner_id`);

--
-- Indexes for table `owners`
--
ALTER TABLE `owners`
  ADD PRIMARY KEY (`owner_id`);

--
-- Indexes for table `properties`
--
ALTER TABLE `properties`
  ADD PRIMARY KEY (`property_id`),
  ADD UNIQUE KEY `unique_property_code_flat` (`property_code`,`flat_number`),
  ADD KEY `lease_id` (`lease_id`);

--
-- Indexes for table `rent_payments`
--
ALTER TABLE `rent_payments`
  ADD PRIMARY KEY (`payment_id`),
  ADD KEY `assignment_id` (`assignment_id`);

--
-- Indexes for table `tenants`
--
ALTER TABLE `tenants`
  ADD PRIMARY KEY (`tenant_id`);

--
-- Indexes for table `tenant_assignments`
--
ALTER TABLE `tenant_assignments`
  ADD PRIMARY KEY (`assignment_id`),
  ADD UNIQUE KEY `tenant_code` (`tenant_code`),
  ADD KEY `tenant_id` (`tenant_id`),
  ADD KEY `property_id` (`property_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cheques`
--
ALTER TABLE `cheques`
  MODIFY `cheque_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leases`
--
ALTER TABLE `leases`
  MODIFY `lease_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `owners`
--
ALTER TABLE `owners`
  MODIFY `owner_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `properties`
--
ALTER TABLE `properties`
  MODIFY `property_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rent_payments`
--
ALTER TABLE `rent_payments`
  MODIFY `payment_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tenants`
--
ALTER TABLE `tenants`
  MODIFY `tenant_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tenant_assignments`
--
ALTER TABLE `tenant_assignments`
  MODIFY `assignment_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cheques`
--
ALTER TABLE `cheques`
  ADD CONSTRAINT `cheques_ibfk_1` FOREIGN KEY (`payment_id`) REFERENCES `rent_payments` (`payment_id`) ON DELETE CASCADE;

--
-- Constraints for table `leases`
--
ALTER TABLE `leases`
  ADD CONSTRAINT `leases_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `owners` (`owner_id`) ON DELETE CASCADE;

--
-- Constraints for table `properties`
--
ALTER TABLE `properties`
  ADD CONSTRAINT `properties_ibfk_1` FOREIGN KEY (`lease_id`) REFERENCES `leases` (`lease_id`) ON DELETE CASCADE;

--
-- Constraints for table `rent_payments`
--
ALTER TABLE `rent_payments`
  ADD CONSTRAINT `rent_payments_ibfk_1` FOREIGN KEY (`assignment_id`) REFERENCES `tenant_assignments` (`assignment_id`) ON DELETE CASCADE;

--
-- Constraints for table `tenant_assignments`
--
ALTER TABLE `tenant_assignments`
  ADD CONSTRAINT `tenant_assignments_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tenant_assignments_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `properties` (`property_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
