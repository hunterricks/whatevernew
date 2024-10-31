-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  location VARCHAR(255) NOT NULL,
  budget DECIMAL(10, 2),
  min_hourly_rate DECIMAL(10, 2),
  max_hourly_rate DECIMAL(10, 2),
  estimated_hours INT,
  budget_type ENUM('fixed', 'hourly') NOT NULL,
  scope ENUM('small', 'medium', 'large') NOT NULL,
  duration VARCHAR(20) NOT NULL,
  experience_level ENUM('entry', 'intermediate', 'expert') NOT NULL,
  status ENUM('open', 'in_progress', 'completed', 'cancelled') DEFAULT 'open',
  payment_status ENUM('pending', 'escrow', 'released', 'refunded') DEFAULT 'pending',
  posted_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (posted_by) REFERENCES users(id),
  has_review BOOLEAN DEFAULT false,
  service_provider_id VARCHAR(36),
  FOREIGN KEY (service_provider_id) REFERENCES users(id)
);

-- Job Skills table
CREATE TABLE IF NOT EXISTS job_skills (
  job_id VARCHAR(36),
  skill VARCHAR(50),
  PRIMARY KEY (job_id, skill),
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- Proposals table
CREATE TABLE IF NOT EXISTS proposals (
  id VARCHAR(36) PRIMARY KEY,
  job_id VARCHAR(36) NOT NULL,
  service_provider_id VARCHAR(36) NOT NULL,
  cover_letter TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  estimated_duration VARCHAR(50) NOT NULL,
  status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id),
  FOREIGN KEY (service_provider_id) REFERENCES users(id)
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(36) PRIMARY KEY,
  job_id VARCHAR(36) NOT NULL,
  reviewer_id VARCHAR(36) NOT NULL,
  reviewee_id VARCHAR(36) NOT NULL,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id),
  FOREIGN KEY (reviewer_id) REFERENCES users(id),
  FOREIGN KEY (reviewee_id) REFERENCES users(id),
  is_private BOOLEAN DEFAULT false
);

-- Repeat Clients table
CREATE TABLE IF NOT EXISTS repeat_clients (
  service_provider_id VARCHAR(36),
  client_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (service_provider_id, client_id),
  FOREIGN KEY (service_provider_id) REFERENCES users(id),
  FOREIGN KEY (client_id) REFERENCES users(id)
);

-- User Stats table
CREATE TABLE IF NOT EXISTS user_stats (
  user_id VARCHAR(36) PRIMARY KEY,
  total_jobs INT DEFAULT 0,
  completed_jobs INT DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  success_score DECIMAL(5,2) DEFAULT 0,
  last_calculated TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Add missing chat tables
CREATE TABLE IF NOT EXISTS chat_rooms (
  id VARCHAR(36) PRIMARY KEY,
  job_id VARCHAR(36),
  client_id VARCHAR(36),
  service_provider_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id),
  FOREIGN KEY (client_id) REFERENCES users(id),
  FOREIGN KEY (service_provider_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(36) PRIMARY KEY,
  room_id VARCHAR(36),
  sender_id VARCHAR(36),
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES chat_rooms(id),
  FOREIGN KEY (sender_id) REFERENCES users(id)
);