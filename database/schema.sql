CREATE DATABASE IF NOT EXISTS hartanah
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE hartanah;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role ENUM('admin', 'agent') NOT NULL DEFAULT 'agent',
  title VARCHAR(100) NOT NULL,
  avatar VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agents (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  region VARCHAR(100) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS properties (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  location VARCHAR(100) NOT NULL,
  price DECIMAL(15, 2) NOT NULL,
  status ENUM('Available', 'Booked', 'Sold', 'D') NOT NULL DEFAULT 'Available',
  agent_id INT UNSIGNED NULL,
  agent_name VARCHAR(100) NULL,
  image VARCHAR(500) NULL,
  notes TEXT NULL,
  sales_package_name VARCHAR(255) NULL,
  sales_package_type VARCHAR(150) NULL,
  sales_package_data LONGBLOB NULL,
  sales_package_calculator LONGTEXT NULL,
  is_kiv TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL,
  CONSTRAINT fk_properties_agent FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS property_images (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  property_id INT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(150) NOT NULL,
  data LONGBLOB NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_property_images_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS property_sales_packages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  property_id INT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(150) NOT NULL,
  data LONGBLOB NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_property_sales_packages_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

INSERT IGNORE INTO users (username, password_hash, name, role, title, avatar) VALUES
  ('admin', '$2b$10$MYHKzPQxznhl/8S.ZwoG6O754I.pxjkn6T7eq/PfLPsYZfc5ermK6', 'Admin Manager', 'admin', 'System Administrator', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80'),
  ('agent', '$2b$10$Sgt0saqpmQb0S2fF.4OvbuG32RLjwbQ.nQClMV2QMh50gUxGFW8LW', 'Aina Roslan', 'agent', 'Sales Agent', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80');

INSERT IGNORE INTO agents (name, region, phone, email) VALUES
  ('Aina Roslan', 'Kuala Lumpur', '+60 12-398 4410', 'aina@hartanahpro.my'),
  ('Daniel Tan', 'Bangi', '+60 13-712 8841', 'daniel@hartanahpro.my'),
  ('Nur Iman', 'Cyberjaya', '+60 17-604 2809', 'iman@hartanahpro.my'),
  ('Farid Hakim', 'Shah Alam', '+60 19-845 1205', 'farid@hartanahpro.my');

INSERT INTO properties (name, location, price, status, agent_id, image)
SELECT 'Seri Maya Residence', 'Kuala Lumpur', 780000, 'Available', id, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80'
FROM agents WHERE name = 'Aina Roslan'
AND NOT EXISTS (SELECT 1 FROM properties WHERE name = 'Seri Maya Residence');

INSERT INTO properties (name, location, price, status, agent_id, image)
SELECT 'Bangi Sentral Terrace', 'Bangi', 540000, 'Booked', id, 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=900&q=80'
FROM agents WHERE name = 'Daniel Tan'
AND NOT EXISTS (SELECT 1 FROM properties WHERE name = 'Bangi Sentral Terrace');

INSERT INTO properties (name, location, price, status, agent_id, image)
SELECT 'Cyberjaya Lakeview Suite', 'Cyberjaya', 420000, 'Available', id, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80'
FROM agents WHERE name = 'Nur Iman'
AND NOT EXISTS (SELECT 1 FROM properties WHERE name = 'Cyberjaya Lakeview Suite');

INSERT INTO properties (name, location, price, status, agent_id, image)
SELECT 'Elmina Green Villa', 'Shah Alam', 1250000, 'Sold', id, 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80'
FROM agents WHERE name = 'Farid Hakim'
AND NOT EXISTS (SELECT 1 FROM properties WHERE name = 'Elmina Green Villa');
