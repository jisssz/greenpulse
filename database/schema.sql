-- GreenPulse Database Schema for MySQL 8.0 / H2 Compatibility
-- Civic Environmental Issue Reporting, Evidence & Enforcement Platform

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(30) NOT NULL,
    profile_image VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_role (role),
    INDEX idx_user_email (email)
);

CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    icon_name VARCHAR(50) DEFAULT 'Trash2',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_number VARCHAR(30) NOT NULL UNIQUE,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    category_id BIGINT NOT NULL,
    citizen_id BIGINT NOT NULL,
    assigned_to BIGINT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    address VARCHAR(255) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    report_type VARCHAR(30) DEFAULT 'ENVIRONMENTAL_ISSUE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    verified_at TIMESTAMP NULL,
    resolved_at TIMESTAMP NULL,
    closed_at TIMESTAMP NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (citizen_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_report_status (status),
    INDEX idx_report_priority (priority),
    INDEX idx_report_citizen (citizen_id),
    INDEX idx_report_location (latitude, longitude)
);

CREATE TABLE IF NOT EXISTS report_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    image_type VARCHAR(30) NOT NULL DEFAULT 'INITIAL',
    uploaded_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- PHASE 2: EVIDENCE ENTITY
CREATE TABLE IF NOT EXISTS evidence (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    evidence_number VARCHAR(30) NOT NULL UNIQUE,
    report_id BIGINT,
    source_type VARCHAR(50) NOT NULL DEFAULT 'CITIZEN_PHOTO',
    submitted_by BIGINT NOT NULL,
    captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    latitude DOUBLE,
    longitude DOUBLE,
    file_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    description VARCHAR(500),
    evidence_hash VARCHAR(64) NOT NULL,
    verification_status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    verified_by BIGINT,
    verified_at TIMESTAMP NULL,
    rejection_reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE SET NULL,
    FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_evidence_status (verification_status),
    INDEX idx_evidence_hash (evidence_hash)
);

-- PHASE 2: ENFORCEMENT CASES ENTITY
CREATE TABLE IF NOT EXISTS enforcement_cases (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    case_number VARCHAR(30) NOT NULL UNIQUE,
    report_id BIGINT,
    evidence_id BIGINT,
    assigned_officer_id BIGINT,
    violation_type VARCHAR(100) NOT NULL,
    case_status VARCHAR(40) NOT NULL DEFAULT 'OPEN',
    priority VARCHAR(20) DEFAULT 'HIGH',
    location VARCHAR(255),
    opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    investigated_at TIMESTAMP NULL,
    closed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE SET NULL,
    FOREIGN KEY (evidence_id) REFERENCES evidence(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_officer_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_case_status (case_status),
    INDEX idx_case_number (case_number)
);

-- PHASE 2: OFFENDERS ENTITY (NO RAW AADHAAR NUMBERS)
CREATE TABLE IF NOT EXISTS offenders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    enforcement_case_id BIGINT NOT NULL UNIQUE,
    identity_status VARCHAR(30) DEFAULT 'IDENTITY_PENDING',
    identification_method VARCHAR(50),
    masked_reference VARCHAR(100),
    vehicle_reference VARCHAR(50),
    verification_source VARCHAR(100),
    verified_by BIGINT,
    verified_at TIMESTAMP NULL,
    FOREIGN KEY (enforcement_case_id) REFERENCES enforcement_cases(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
);

-- PHASE 2: INVESTIGATION NOTES
CREATE TABLE IF NOT EXISTS investigation_notes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    enforcement_case_id BIGINT NOT NULL,
    officer_id BIGINT NOT NULL,
    note TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (enforcement_case_id) REFERENCES enforcement_cases(id) ON DELETE CASCADE,
    FOREIGN KEY (officer_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- PHASE 2: FINES & CHALLANS ENTITY
CREATE TABLE IF NOT EXISTS fines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    enforcement_case_id BIGINT NOT NULL UNIQUE,
    challan_number VARCHAR(30) NOT NULL UNIQUE,
    violation_type VARCHAR(100) NOT NULL,
    fine_amount DOUBLE NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    issued_by BIGINT NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP NULL,
    payment_status VARCHAR(30) NOT NULL DEFAULT 'ISSUED',
    paid_at TIMESTAMP NULL,
    external_reference VARCHAR(100),
    FOREIGN KEY (enforcement_case_id) REFERENCES enforcement_cases(id) ON DELETE CASCADE,
    FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_fine_challan (challan_number),
    INDEX idx_fine_status (payment_status)
);

-- PHASE 2: REWARD POLICY CONFIGURATION
CREATE TABLE IF NOT EXISTS reward_policies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    reward_percentage DOUBLE NOT NULL DEFAULT 10.0,
    maximum_reward DOUBLE NOT NULL DEFAULT 500.0,
    minimum_fine DOUBLE NOT NULL DEFAULT 500.0,
    enabled BOOLEAN DEFAULT TRUE,
    effective_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    effective_to TIMESTAMP NULL
);

-- PHASE 2: CITIZEN REWARDS ENTITY
CREATE TABLE IF NOT EXISTS rewards (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    enforcement_case_id BIGINT NOT NULL,
    contributor_id BIGINT NOT NULL,
    fine_id BIGINT NOT NULL,
    reward_percentage DOUBLE NOT NULL,
    eligible_amount DOUBLE NOT NULL,
    approved_amount DOUBLE NOT NULL,
    payment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    payment_reference VARCHAR(100),
    approved_at TIMESTAMP NULL,
    paid_at TIMESTAMP NULL,
    fraud_flag VARCHAR(30) DEFAULT 'NORMAL',
    FOREIGN KEY (enforcement_case_id) REFERENCES enforcement_cases(id) ON DELETE CASCADE,
    FOREIGN KEY (contributor_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (fine_id) REFERENCES fines(id) ON DELETE CASCADE,
    INDEX idx_reward_contributor (contributor_id),
    INDEX idx_reward_status (payment_status)
);

-- PHASE 2: MOCK GOVERNMENT VERIFICATIONS AUDIT
CREATE TABLE IF NOT EXISTS government_verifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    enforcement_case_id BIGINT NOT NULL,
    verification_type VARCHAR(50) NOT NULL,
    provider VARCHAR(100) NOT NULL DEFAULT 'SIMULATED_AUTHORITY_ADAPTER',
    external_reference VARCHAR(100) NOT NULL,
    verification_status VARCHAR(30) NOT NULL DEFAULT 'VERIFIED',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    requested_by BIGINT NOT NULL,
    FOREIGN KEY (enforcement_case_id) REFERENCES enforcement_cases(id) ON DELETE CASCADE,
    FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS report_status_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_id BIGINT NOT NULL,
    old_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    changed_by BIGINT NOT NULL,
    comment VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message VARCHAR(500) NOT NULL,
    type VARCHAR(50) DEFAULT 'INFO',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notification_user (user_id, is_read)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT,
    metadata TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_action (action),
    INDEX idx_audit_user (user_id)
);
