-- MySQL dump 10.13  Distrib 8.4.3, for Win64 (x86_64)
--
-- Host: localhost    Database: evopay_checkout
-- ------------------------------------------------------
-- Server version	8.4.3

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2026_11_16_063310_create_products_table',1),(5,'2026_11_16_063311_create_product_units_table',1),(6,'2026_11_16_063312_create_price_breaks_table',1),(7,'2026_11_16_074916_create_orders_table',2),(8,'2026_11_16_075325_add_image_url_to_products_table',3),(9,'2026_11_16_075513_change_unit_type_to_string_in_product_units_table',4);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `payment_method` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mpgs_session_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `items` json DEFAULT NULL,
  `customer` json DEFAULT NULL,
  `delivery` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orders_order_number_unique` (`order_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `price_breaks`
--

DROP TABLE IF EXISTS `price_breaks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `price_breaks` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_unit_id` bigint unsigned NOT NULL,
  `min_qty` int unsigned NOT NULL,
  `max_qty` int unsigned DEFAULT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'KES',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `price_breaks_product_unit_id_min_qty_max_qty_index` (`product_unit_id`,`min_qty`,`max_qty`),
  CONSTRAINT `price_breaks_product_unit_id_foreign` FOREIGN KEY (`product_unit_id`) REFERENCES `product_units` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `price_breaks`
--

LOCK TABLES `price_breaks` WRITE;
/*!40000 ALTER TABLE `price_breaks` DISABLE KEYS */;
INSERT INTO `price_breaks` VALUES (1,1,1,NULL,800.00,'KES',1,'2026-11-16 04:55:32','2026-11-16 05:32:17'),(2,1,10,NULL,11724.30,'KES',1,'2026-11-16 04:55:32','2026-11-16 04:55:32'),(3,2,1,NULL,800.00,'KES',1,'2026-11-16 04:55:32','2026-11-16 05:35:20'),(4,2,10,NULL,10696.50,'KES',1,'2026-11-16 04:55:32','2026-11-16 04:55:32'),(11,6,1,9,41314.00,'KES',1,'2026-11-16 04:55:32','2026-11-16 04:55:32'),(12,6,10,NULL,37182.60,'KES',1,'2026-11-16 04:55:32','2026-11-16 04:55:32'),(15,8,1,9,39348.00,'KES',1,'2026-11-16 04:55:32','2026-11-16 04:55:32'),(16,8,10,NULL,35413.20,'KES',1,'2026-11-16 04:55:32','2026-11-16 04:55:32'),(17,9,1,9,31500.00,'KES',1,'2026-11-16 04:55:33','2026-11-16 04:55:33'),(18,9,10,NULL,28350.00,'KES',1,'2026-11-16 04:55:33','2026-11-16 04:55:33'),(19,10,1,NULL,800.00,'KES',1,'2026-11-16 04:55:33','2026-11-16 05:14:29'),(20,10,10,NULL,31917.60,'KES',1,'2026-11-16 04:55:33','2026-11-16 04:55:33'),(21,11,1,NULL,800.00,'KES',1,'2026-11-16 04:55:33','2026-11-16 05:23:18'),(22,11,10,NULL,8701.20,'KES',1,'2026-11-16 04:55:33','2026-11-16 04:55:33'),(23,12,1,NULL,800.00,'KES',1,'2026-11-16 04:55:33','2026-11-16 05:27:33'),(24,12,10,NULL,42966.00,'KES',1,'2026-11-16 04:55:33','2026-11-16 04:55:33'),(27,14,1,9,47186.00,'KES',1,'2026-11-16 04:55:33','2026-11-16 04:55:33'),(28,14,10,NULL,42467.40,'KES',1,'2026-11-16 04:55:33','2026-11-16 04:55:33'),(29,15,1,9,28260.00,'KES',1,'2026-11-16 04:55:33','2026-11-16 04:55:33'),(30,15,10,NULL,25434.00,'KES',1,'2026-11-16 04:55:33','2026-11-16 04:55:33'),(31,16,1,9,40846.00,'KES',1,'2026-11-16 04:55:33','2026-11-16 04:55:33'),(32,16,10,NULL,36761.40,'KES',1,'2026-11-16 04:55:33','2026-11-16 04:55:33'),(33,17,1,9,14778.00,'KES',1,'2026-11-16 04:55:33','2026-11-16 04:55:33'),(34,17,10,NULL,13300.20,'KES',1,'2026-11-16 04:55:33','2026-11-16 04:55:33'),(35,18,1,9,49217.00,'KES',1,'2026-11-16 04:55:33','2026-11-16 04:55:33'),(36,18,10,NULL,44295.30,'KES',1,'2026-11-16 04:55:33','2026-11-16 04:55:33'),(37,19,1,9,12551.00,'KES',1,'2026-11-16 04:55:33','2026-11-16 04:55:33'),(38,19,10,NULL,11295.90,'KES',1,'2026-11-16 04:55:33','2026-11-16 04:55:33'),(39,20,1,9,25257.00,'KES',1,'2026-11-16 04:55:33','2026-11-16 04:55:33'),(40,20,10,NULL,22731.30,'KES',1,'2026-11-16 04:55:33','2026-11-16 04:55:33'),(41,21,1,9,32360.00,'KES',1,'2026-11-16 04:55:33','2026-11-16 04:55:33'),(42,21,10,NULL,29124.00,'KES',1,'2026-11-16 04:55:33','2026-11-16 04:55:33'),(43,22,1,9,40882.00,'KES',1,'2026-11-16 04:55:33','2026-11-16 04:55:33'),(44,22,10,NULL,36793.80,'KES',1,'2026-11-16 04:55:33','2026-11-16 04:55:33'),(45,23,1,9,18767.00,'KES',1,'2026-11-16 04:55:33','2026-11-16 04:55:33'),(46,23,10,NULL,16890.30,'KES',1,'2026-11-16 04:55:33','2026-11-16 04:55:33'),(47,24,1,9,43372.00,'KES',1,'2026-11-16 04:55:33','2026-11-16 04:55:33'),(48,24,10,NULL,39034.80,'KES',1,'2026-11-16 04:55:33','2026-11-16 04:55:33'),(49,25,1,9,35511.00,'KES',1,'2026-11-16 04:55:33','2026-11-16 04:55:33'),(50,25,10,NULL,31959.90,'KES',1,'2026-11-16 04:55:33','2026-11-16 04:55:33'),(51,1,1,49,800.00,'KES',1,'2026-11-16 05:31:09','2026-11-16 05:31:09'),(52,1,50,NULL,760.00,'KES',1,'2026-11-16 05:31:09','2026-11-16 05:31:09'),(53,2,1,49,720.00,'KES',1,'2026-11-16 05:31:09','2026-11-16 05:31:09'),(54,2,50,NULL,684.00,'KES',1,'2026-11-16 05:31:09','2026-11-16 05:31:09'),(58,6,1,NULL,20000.00,'KES',1,'2026-11-16 05:31:09','2026-11-16 05:43:28'),(60,8,1,NULL,75000.00,'KES',1,'2026-11-16 05:31:09','2026-11-16 05:31:09'),(61,9,1,NULL,95000.00,'KES',1,'2026-11-16 05:31:09','2026-11-16 05:31:09'),(62,10,1,NULL,18500.00,'KES',1,'2026-11-16 05:31:09','2026-11-16 05:31:09'),(63,11,1,NULL,8500.00,'KES',1,'2026-11-16 05:31:09','2026-11-16 05:31:09'),(64,12,1,NULL,2500.00,'KES',1,'2026-11-16 05:31:09','2026-11-16 05:31:09'),(66,14,1,NULL,65000.00,'KES',1,'2026-11-16 05:31:09','2026-11-16 05:31:09'),(67,15,1,NULL,25000.00,'KES',1,'2026-11-16 05:31:09','2026-11-16 05:31:09'),(68,3,1,NULL,800.00,'KES',1,'2026-11-16 05:53:18','2026-11-16 05:53:18'),(69,4,1,NULL,800.00,'KES',1,'2026-11-16 05:53:29','2026-11-16 05:53:29'),(71,5,1,NULL,300000.00,'KES',1,'2026-11-16 05:53:47','2026-11-16 05:53:47'),(72,7,1,NULL,58698.00,'KES',1,'2026-11-16 05:53:55','2026-11-16 05:53:55'),(73,13,1,NULL,81316.00,'KES',1,'2026-11-16 05:54:16','2026-11-16 05:54:16');
/*!40000 ALTER TABLE `price_breaks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_units`
--

DROP TABLE IF EXISTS `product_units`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_units` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `product_id` bigint unsigned NOT NULL,
  `unit_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `base_qty_in_bags` int unsigned NOT NULL,
  `min_qty` int unsigned NOT NULL DEFAULT '1',
  `step_qty` int unsigned NOT NULL DEFAULT '1',
  `requires_quote` tinyint(1) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `product_units_product_id_unit_type_unique` (`product_id`,`unit_type`),
  KEY `product_units_product_id_is_active_index` (`product_id`,`is_active`),
  CONSTRAINT `product_units_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_units`
--

LOCK TABLES `product_units` WRITE;
/*!40000 ALTER TABLE `product_units` DISABLE KEYS */;
INSERT INTO `product_units` VALUES (1,1,'bag','50KG Bag',1,1,1,0,1,'2026-11-16 05:31:09','2026-11-16 05:31:09'),(2,2,'bag','50KG Bag',1,1,1,0,1,'2026-11-16 05:31:09','2026-11-16 05:31:09'),(3,3,'piece','1 Unit',1,1,1,0,1,'2026-11-16 05:31:09','2026-11-16 05:31:09'),(4,4,'piece','1 Unit',1,1,1,0,1,'2026-11-16 05:31:09','2026-11-16 05:31:09'),(5,5,'piece','1 Unit',1,1,1,0,1,'2026-11-16 05:31:09','2026-11-16 05:31:09'),(6,6,'piece','1 Unit',1,1,1,0,1,'2026-11-16 05:31:09','2026-11-16 05:31:09'),(7,7,'piece','1 Unit',1,1,1,0,1,'2026-11-16 05:31:09','2026-11-16 05:31:09'),(8,8,'piece','1 Unit',1,1,1,0,1,'2026-11-16 05:31:09','2026-11-16 05:31:09'),(9,9,'piece','1 Unit',1,1,1,0,1,'2026-11-16 05:31:09','2026-11-16 05:31:09'),(10,10,'piece','1 Unit',1,1,1,0,1,'2026-11-16 05:31:09','2026-11-16 05:31:09'),(11,11,'piece','1 Unit',1,1,1,0,1,'2026-11-16 05:31:09','2026-11-16 05:31:09'),(12,12,'piece','1 Unit',1,1,1,0,1,'2026-11-16 05:31:09','2026-11-16 05:31:09'),(13,13,'piece','1 Unit',1,1,1,0,1,'2026-11-16 05:31:09','2026-11-16 05:31:09'),(14,14,'piece','1 Unit',1,1,1,0,1,'2026-11-16 05:31:09','2026-11-16 05:31:09'),(15,15,'piece','1 Unit',1,1,1,0,1,'2026-11-16 05:31:09','2026-11-16 05:31:09');
/*!40000 ALTER TABLE `product_units` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `short_description` text COLLATE utf8mb4_unicode_ci,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'cement',
  `brand` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Mombasa Cement',
  `kebs_certified` tinyint(1) NOT NULL DEFAULT '1',
  `grade` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `specs` json DEFAULT NULL,
  `best_used_for` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `products_slug_unique` (`slug`),
  UNIQUE KEY `products_sku_unique` (`sku`),
  KEY `products_is_active_category_index` (`is_active`,`category`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'KP Super Gold Cement','https://res.cloudinary.com/dvqjgbdhp/image/upload/v1794816340/KP-Super-Gold_ydvzed.png','kp-super-gold-cement-1','SKU-14085',NULL,'Premium quality kp super gold cement.',NULL,'Hardware','Mombasa Cement',1,NULL,1,NULL,NULL,'2026-11-16 05:31:09','2026-11-16 05:32:17'),(2,'KP GOLD cement','https://res.cloudinary.com/dvqjgbdhp/image/upload/v1794817616/3_l2fvha.jpg','kp-gold-cement-2','SKU-27417',NULL,'Premium quality nyumba plus cement.',NULL,'Hardware','Mombasa Cement',1,NULL,1,NULL,NULL,'2026-11-16 05:31:09','2026-11-16 05:35:20'),(3,'KP PLATINUM','https://res.cloudinary.com/dvqjgbdhp/image/upload/v1794818369/10_p01cus.jpg','kp-platinum-3','SKU-85923',NULL,'KP-Platinum is a Portland Cement (52.5N) designed for precision finishing and plastering work. It delivers a consistently smooth, durable surface that holds up over time,  both indoors and outdoors. Produced by Mombasa Cement, one of East Africa\'s most trusted manufacturers, KP-Platinum meets Kenya\'s mandatory KEBS quality standards for construction materials.',NULL,'Hardware','Mombasa Cement',1,NULL,1,NULL,NULL,'2026-11-16 05:31:09','2026-11-16 05:40:04'),(4,'KP DIAMOND','https://res.cloudinary.com/dvqjgbdhp/image/upload/v1794818465/7_sec7vd.jpg','kp-diamond-4','SKU-65675',NULL,'KP-Diamond is a high-strength Portland Cement (42.5N) engineered for structural work that demands maximum performance. When the project can\'t afford to compromise — foundations, columns, and load-bearing structures — KP-Diamond delivers. Produced by Mombasa Cement, KEBS certified and built for Kenya\'s most demanding builds.',NULL,'Hardware','Mombasa Cement',1,NULL,1,NULL,NULL,'2026-11-16 05:31:09','2026-11-16 05:41:50'),(5,'Dahua ALPR camera','https://res.cloudinary.com/dvqjgbdhp/image/upload/v1794818552/ITC237-PW1B-IRZ_mucah1.jpg','dahua-alpr-camera-5','SKU-97583',NULL,'',NULL,'Electronics','Mombasa Cement',1,NULL,1,NULL,NULL,'2026-11-16 05:31:09','2026-11-16 05:42:53'),(6,'Cisco Router','https://res.cloudinary.com/dvqjgbdhp/image/upload/v1794204323/MS3548X01_FC_eoorm6.jpg','cisco-router-6','SKU-61838',NULL,'',NULL,'Electronics','Mombasa Cement',1,NULL,1,NULL,NULL,'2026-11-16 05:31:09','2026-11-16 05:43:28'),(7,'Samsung 65\" Smart TV','https://res.cloudinary.com/dvqjgbdhp/image/upload/v1794818644/Samsung-43-Class-QLED-Q7F-4K-Samsung-Vision-AI-Smart-TV-2025_9fd18157-874a-406c-9de5-fd77a615b2b5.43faef69558098e113e14a5d3f4f0dca_tzplgk.jpg','samsung-65-smart-tv-7','SKU-73054',NULL,'Premium quality samsung 65\" smart tv.',NULL,'Electronics','Mombasa Cement',1,NULL,1,NULL,NULL,'2026-11-16 05:31:09','2026-11-16 05:44:23'),(8,'HP Pavilion Laptop 15\"','https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80','hp-pavilion-laptop-15-764','SKU-12866',NULL,'Premium quality hp pavilion laptop 15\".',NULL,'Electronics','Mombasa Cement',1,NULL,1,NULL,NULL,'2026-11-16 05:31:09','2026-11-16 05:31:09'),(9,'iPhone 13 Pro Max 128GB','https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&q=80','iphone-13-pro-max-128gb-120','SKU-23107',NULL,'Premium quality iphone 13 pro max 128gb.',NULL,'Electronics','Mombasa Cement',1,NULL,1,NULL,NULL,'2026-11-16 05:31:09','2026-11-16 05:31:09'),(10,'Sony Wireless Headphones','https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80','sony-wireless-headphones-305','SKU-64892',NULL,'Premium quality sony wireless headphones.',NULL,'Electronics','Mombasa Cement',1,NULL,1,NULL,NULL,'2026-11-16 05:31:09','2026-11-16 05:31:09'),(11,'JBL Bluetooth Speaker','https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80','jbl-bluetooth-speaker-465','SKU-58953',NULL,'Premium quality jbl bluetooth speaker.',NULL,'Electronics','Mombasa Cement',1,NULL,1,NULL,NULL,'2026-11-16 05:31:09','2026-11-16 05:31:09'),(12,'Logitech Wireless Mouse','https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80','logitech-wireless-mouse-615','SKU-55035',NULL,'Premium quality logitech wireless mouse.',NULL,'Electronics','Mombasa Cement',1,NULL,1,NULL,NULL,'2026-11-16 05:31:09','2026-11-16 05:31:09'),(13,'PlayStation 5 Console','https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&q=80','playstation-5-console-13','SKU-92002',NULL,'Premium quality playstation 5 console.',NULL,'Electronics','Mombasa Cement',1,NULL,1,NULL,NULL,'2026-11-16 05:31:09','2026-11-16 05:44:52'),(14,'Canon DSLR Camera','https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80','canon-dslr-camera-427','SKU-20640',NULL,'Premium quality canon dslr camera.',NULL,'Electronics','Mombasa Cement',1,NULL,1,NULL,NULL,'2026-11-16 05:31:09','2026-11-16 05:31:09'),(15,'Smart Watch Series 7','https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80','smart-watch-series-7-307','SKU-95379',NULL,'Premium quality smart watch series 7.',NULL,'Electronics','Mombasa Cement',1,NULL,1,NULL,NULL,'2026-11-16 05:31:09','2026-11-16 05:31:09');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('98pA6yN4oCmPTQCXZvl2FWpyOTSHX6GMtKCE4abv',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiaEtlWjUwWHlabXZ4MGlXQWtwMTdpVXNDWVZyb0g1bUJ6UnJCWnlPdSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mjc6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9hZG1pbiI7czo1OiJyb3V0ZSI7czoxMToiYWRtaW4uaW5kZXgiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1794819385),('vZTV0H2CtjN2tPoAfN3RwwAtFrndgAi9WwVYesja',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoibTBxVHJzNU9CS250dlZsZmdzenhHYU5SUUhTWGNDZlBmOWZDaXExRSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzA6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9jaGVja291dCI7czo1OiJyb3V0ZSI7czoxNDoiY2hlY2tvdXQuaW5kZXgiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1794819848);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-16 12:29:49
