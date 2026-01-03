-- ===============================
-- Dayflow HRMS Database
-- ===============================

CREATE DATABASE IF NOT EXISTS dayflow_hrms;
USE dayflow_hrms;

-- ===============================
-- USERS (AUTH + ROLES)
-- ===============================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_code VARCHAR(50) UNIQUE,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('ADMIN','HR','EMPLOYEE') DEFAULT 'EMPLOYEE',
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- EMPLOYEES
-- ===============================
CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  full_name VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  designation VARCHAR(100),
  department VARCHAR(100),
  joining_date DATE,
  profile_image VARCHAR(255),
  dob DATE,
  gender ENUM('Male', 'Female', 'Other'),
  marital_status ENUM('Single', 'Married', 'Divorced', 'Widowed'),
  nationality VARCHAR(50),
  personal_email VARCHAR(100),
  location VARCHAR(100),
  manager_id INT,
  about TEXT,
  skills TEXT,
  interests TEXT,
  certifications TEXT,
  bank_name VARCHAR(100),
  account_number VARCHAR(50),
  ifsc_code VARCHAR(20),
  pan_no VARCHAR(20),
  uan_no VARCHAR(20),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===============================
-- EMPLOYEE DOCUMENTS
-- ===============================
CREATE TABLE employee_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT,
  document_type VARCHAR(50),
  file_path VARCHAR(255),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- ===============================
-- ATTENDANCE (OFFLINE SUPPORT)
-- ===============================
CREATE TABLE attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT,
  attendance_date DATE,
  check_in TIME,
  check_out TIME,
  status ENUM('Present','Absent','Half-day','Leave'),
  source ENUM('ONLINE','OFFLINE') DEFAULT 'ONLINE',
  synced BOOLEAN DEFAULT TRUE,
  client_timestamp DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(employee_id, attendance_date),
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- ===============================
-- LEAVE TYPES
-- ===============================
CREATE TABLE leave_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50),
  description TEXT
);

-- ===============================
-- LEAVE REQUESTS
-- ===============================
CREATE TABLE leave_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT,
  leave_type_id INT,
  start_date DATE,
  end_date DATE,
  reason TEXT,
  status ENUM('Pending','Approved','Rejected') DEFAULT 'Pending',
  admin_comment TEXT,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (leave_type_id) REFERENCES leave_types(id)
);

-- ===============================
-- SALARY STRUCTURE
-- ===============================
CREATE TABLE salary_structures (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT,
  monthly_wage DECIMAL(10,2),
  working_days INT DEFAULT 5,
  working_hours INT DEFAULT 8,
  basic_pct DECIMAL(5,2) DEFAULT 50.00,
  hra_pct DECIMAL(5,2) DEFAULT 50.00,
  lta_pct DECIMAL(5,2) DEFAULT 8.33,
  standard_allowance DECIMAL(10,2) DEFAULT 0,
  performance_bonus_pct DECIMAL(5,2) DEFAULT 8.33,
  pf_pct DECIMAL(5,2) DEFAULT 12.00,
  prof_tax DECIMAL(10,2) DEFAULT 200.00,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- ===============================
-- PAYROLL
-- ===============================
CREATE TABLE payroll (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT,
  month VARCHAR(20),
  net_salary DECIMAL(10,2),
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- ===============================
-- NOTIFICATIONS
-- ===============================
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ===============================
-- OFFLINE SYNC LOGS
-- ===============================
CREATE TABLE offline_sync_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entity_type VARCHAR(50),
  entity_id INT,
  synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
