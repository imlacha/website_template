-- MySQL Database Initialization Script
SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS `ecommerce_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ecommerce_db`;

-- Drop tables if exist to ensure clean slate
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `cart_items`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `user_roles`;
DROP TABLE IF EXISTS `roles`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Create Roles Table
CREATE TABLE `roles` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Create Users Table
CREATE TABLE `users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `enabled` BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Create User Roles Join Table
CREATE TABLE `user_roles` (
  `user_id` BIGINT NOT NULL,
  `role_id` BIGINT NOT NULL,
  PRIMARY KEY (`user_id`, `role_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Create Categories Table
CREATE TABLE `categories` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Create Products Table
CREATE TABLE `products` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(10, 2) NOT NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `category_id` BIGINT DEFAULT NULL,
  `image_url` VARCHAR(500) DEFAULT NULL,
  `click_count` BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Create Cart Items Table
CREATE TABLE `cart_items` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `product_id` BIGINT NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Create Orders Table
CREATE TABLE `orders` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  `total_amount` DECIMAL(10, 2) NOT NULL,
  `shipping_address` VARCHAR(500) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Create Order Items Table
CREATE TABLE `order_items` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT NOT NULL,
  `product_id` BIGINT NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `price` DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ==================== DATA SEEDING ====================

-- Insert Roles
INSERT INTO `roles` (`id`, `name`) VALUES 
(1, 'ROLE_USER'),
(2, 'ROLE_ADMIN');

-- user@example.com -> password123
-- admin@example.com -> admin123
INSERT INTO `users` (`id`, `email`, `password`, `name`, `enabled`) VALUES
(1, 'user@example.com', '$2a$10$IYIgB/kMP6q0Gr9sLybrheSdHqmagGaXn/mRxCTh50dXQjuS8AIyy', 'Normal User', 1),
(2, 'admin@example.com', '$2a$10$ZVed7VLm0BRHAlC5dA5jVOjW6c7oLJ9FetUMDI.mVfTyFU.eZduO.', 'System Administrator', 1);

-- Map Users to Roles
INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES
(1, 1), -- Normal User is USER
(2, 2); -- Admin is ADMIN

-- Insert Categories
INSERT INTO `categories` (`id`, `name`) VALUES
(1, '限量玩偶公仔'),
(2, '療癒生活日常'),
(3, '超萌配件周邊');

-- Insert Products
INSERT INTO `products` (`id`, `name`, `description`, `price`, `stock`, `category_id`, `image_url`, `click_count`) VALUES
(1, '吉依卡哇超可愛趴姿公仔', '軟萌可彈的吉依卡哇 Hamster 趴姿絨毛玩偶，放在書桌前或抱在懷裡都超級療癒！', 59.99, 100, 1, '/chiikawa_plush.png', 150),
(2, '小八貓治癒表情大抱枕', '可愛的小八貓微笑大抱枕，採用極致柔軟材質，給您滿滿的安全感！', 89.99, 80, 1, '/hachiware_plush.png', 230),
(3, '兔兔超高速保溫杯', '黃色兔兔專屬圖樣保溫杯，保溫效果絕佳，跟著兔兔一起高聲歡呼 Ya-ha！', 39.99, 150, 2, '/usagi_plush.png', 190),
(4, '飛鼠蓬鬆絨毛大尾巴玩偶', '飛鼠標誌性的蓬鬆大尾巴玩偶，抱起來蓬鬆感十足，帶有一點點驕傲的可愛表情。', 69.99, 50, 3, '/momonga_plush.png', 110);

-- Insert Some Dummy Orders for Analytics Dashboard
INSERT INTO `orders` (`id`, `user_id`, `status`, `total_amount`, `shipping_address`) VALUES
(1, 1, 'COMPLETED', 149.98, '吉依卡哇村莊甜點街 7 號'),
(2, 1, 'COMPLETED', 39.99, '小八貓的溫馨小山洞 2 樓'),
(3, 1, 'PENDING', 59.99, '兔兔的胡蘿蔔園區 3 號');

-- Insert Order Items mapping to dummy orders
INSERT INTO `order_items` (`order_id`, `product_id`, `quantity`, `price`) VALUES
(1, 1, 1, 59.99), -- 1x 吉依卡哇
(1, 2, 1, 89.99), -- 1x 小八貓
(2, 3, 1, 39.99), -- 1x 兔兔杯
(3, 1, 1, 59.99); -- 1x 吉依卡哇
