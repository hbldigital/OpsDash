-- ==============================================================================
-- NADRA PAKISTAN - ZONE-D LARKANA OPERATIONAL REPORTING SYSTEM
-- Relational Database DDL & Schema Migrations
-- Compatible with PostgreSQL 14+ / MySQL 8.0+
-- ==============================================================================

-- 1. Organizations & Zones
CREATE TABLE IF NOT EXISTS organizations (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    headquarters VARCHAR(255) DEFAULT 'Islamabad',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS zones (
    id VARCHAR(36) PRIMARY KEY,
    organization_id VARCHAR(36) REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    region VARCHAR(100) DEFAULT 'Sindh',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Offices (DAUs, NRCs, MRVs)
CREATE TABLE IF NOT EXISTS offices (
    id VARCHAR(36) PRIMARY KEY,
    zone_id VARCHAR(36) REFERENCES zones(id),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    district VARCHAR(100) NOT NULL,
    office_type VARCHAR(50) NOT NULL DEFAULT 'NRC', -- 'NRC', 'DAU', 'MRV', 'EXECUTIVE'
    total_counters INT NOT NULL DEFAULT 4,
    expected_staff INT NOT NULL DEFAULT 10,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_offices_zone ON offices(zone_id);
CREATE INDEX IF NOT EXISTS idx_offices_code ON offices(code);

-- 3. Roles and Permissions
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS permissions (
    id VARCHAR(100) PRIMARY KEY,
    module VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id VARCHAR(50) REFERENCES roles(id) ON DELETE CASCADE,
    permission_id VARCHAR(100) REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 4. Users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) REFERENCES roles(id),
    zone_id VARCHAR(36) REFERENCES zones(id),
    assigned_office_code VARCHAR(50) REFERENCES offices(code),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Reporting Uploads & OCR Jobs
CREATE TABLE IF NOT EXISTS report_uploads (
    id VARCHAR(36) PRIMARY KEY,
    uploaded_by VARCHAR(36) REFERENCES users(id),
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    storage_path TEXT NOT NULL,
    detected_report_title VARCHAR(255),
    detected_reporting_date DATE,
    detected_zone VARCHAR(100),
    ocr_confidence NUMERIC(5,2),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'PROCESSING', 'EXTRACTED', 'COMMITTED', 'REJECTED'
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ocr_extraction_jobs (
    id VARCHAR(36) PRIMARY KEY,
    upload_id VARCHAR(36) REFERENCES report_uploads(id) ON DELETE CASCADE,
    engine VARCHAR(50) NOT NULL DEFAULT 'GEMINI_VISION',
    raw_response_json JSONB,
    source_total_employees INT,
    source_total_qmatic_issued INT,
    source_total_qmatic_processed INT,
    source_total_oneapp_issued INT,
    source_total_oneapp_processed INT,
    source_total_oneapp_skipped INT,
    source_total_approved_oneapp INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ocr_extracted_rows (
    id VARCHAR(36) PRIMARY KEY,
    job_id VARCHAR(36) REFERENCES ocr_extraction_jobs(id) ON DELETE CASCADE,
    row_index INT NOT NULL,
    matched_office_code VARCHAR(50),
    matched_office_name VARCHAR(255),
    raw_row_text TEXT,
    confidence_score NUMERIC(5,2),
    data JSONB NOT NULL,
    validation_status VARCHAR(50) DEFAULT 'VALID',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Confirmed Office Daily Reports
CREATE TABLE IF NOT EXISTS office_daily_reports (
    id VARCHAR(36) PRIMARY KEY,
    reporting_date DATE NOT NULL,
    zone_code VARCHAR(50) NOT NULL,
    office_code VARCHAR(50) NOT NULL REFERENCES offices(code),
    office_name VARCHAR(255) NOT NULL,
    reporting_status VARCHAR(50) NOT NULL DEFAULT 'REPORTED', -- 'REPORTED', 'PENDING', 'CORRECTED'
    
    -- Attendance
    total_employees INT NOT NULL DEFAULT 0,
    late_after_745 INT NOT NULL DEFAULT 0,
    late_after_800 INT NOT NULL DEFAULT 0,
    on_time_employees INT NOT NULL DEFAULT 0,
    
    -- Q-Matic
    qmatic_issued INT NOT NULL DEFAULT 0,
    qmatic_processed INT NOT NULL DEFAULT 0,
    qmatic_remaining INT NOT NULL DEFAULT 0,
    qmatic_percentage NUMERIC(6,2),
    
    -- OneApp
    oneapp_issued INT NOT NULL DEFAULT 0,
    oneapp_processed INT NOT NULL DEFAULT 0,
    oneapp_skipped INT NOT NULL DEFAULT 0,
    oneapp_remaining INT NOT NULL DEFAULT 0,
    oneapp_reconciliation_pct NUMERIC(6,2),
    
    -- Approved OneApp
    approved_oneapp INT NOT NULL DEFAULT 0,
    prev_day_approved_oneapp INT DEFAULT 0,
    approved_difference INT DEFAULT 0,
    
    -- Facial Recognition
    diminished_fingerprints_mbvs INT NOT NULL DEFAULT 0,
    proof_of_life_certificates INT NOT NULL DEFAULT 0,
    
    -- Pak-ID
    pakid_approved INT NOT NULL DEFAULT 0,
    pakid_deferred INT NOT NULL DEFAULT 0,
    pakid_correction INT NOT NULL DEFAULT 0,
    
    -- Metadata & Discrepancies
    has_discrepancy BOOLEAN NOT NULL DEFAULT FALSE,
    discrepancy_details TEXT,
    source_upload_id VARCHAR(36) REFERENCES report_uploads(id),
    submitted_by VARCHAR(36) REFERENCES users(id),
    verified_by VARCHAR(36) REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_office_date UNIQUE (office_code, reporting_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON office_daily_reports(reporting_date);
CREATE INDEX IF NOT EXISTS idx_daily_reports_office ON office_daily_reports(office_code);
CREATE INDEX IF NOT EXISTS idx_daily_reports_zone ON office_daily_reports(zone_code);

-- 7. Report Corrections History
CREATE TABLE IF NOT EXISTS report_corrections (
    id VARCHAR(36) PRIMARY KEY,
    report_id VARCHAR(36) REFERENCES office_daily_reports(id) ON DELETE CASCADE,
    corrected_by VARCHAR(36) REFERENCES users(id),
    reason TEXT NOT NULL,
    previous_values JSONB NOT NULL,
    new_values JSONB NOT NULL,
    corrected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Data Validation Issues & Reconciliation Flags
CREATE TABLE IF NOT EXISTS data_validation_issues (
    id VARCHAR(36) PRIMARY KEY,
    reporting_date DATE NOT NULL,
    office_code VARCHAR(50) NOT NULL REFERENCES offices(code),
    issue_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL DEFAULT 'WARNING', -- 'CRITICAL', 'WARNING', 'NOTICE'
    description TEXT NOT NULL,
    suggested_action TEXT,
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_by VARCHAR(36) REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_validation_issues_resolved ON data_validation_issues(is_resolved, reporting_date);

-- 9. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(36),
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    reporting_date DATE,
    office_code VARCHAR(50),
    ip_address VARCHAR(45)
);

CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);

-- 10. Application Settings
CREATE TABLE IF NOT EXISTS application_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
