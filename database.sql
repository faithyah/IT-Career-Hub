-- Import this file in phpMyAdmin (Import tab) or run it in the SQL tab.
CREATE DATABASE IF NOT EXISTS it_career_hub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE it_career_hub;

CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(30)  NOT NULL UNIQUE,
  email         VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS saved_items (
  user_id  INT UNSIGNED NOT NULL,
  item_id  VARCHAR(10)  NOT NULL,           -- j1..j8 = jobs, s1..s7 = sidelines
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, item_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_skills (
  user_id  INT UNSIGNED NOT NULL,
  skill_id VARCHAR(10)  NOT NULL,           -- py, sql, js ...
  status   ENUM('learning','have') NOT NULL,
  PRIMARY KEY (user_id, skill_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
