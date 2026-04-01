CREATE TABLE IF NOT EXISTS enquiries (
    enquiry_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES "user"(id),
    enquiry_type VARCHAR(20) CHECK (enquiry_type IN ('pre-sales', 'support', 'consultation')),
    subject VARCHAR(200),
    message TEXT,
    status VARCHAR(20) CHECK (status IN ('new', 'in-progress', 'resolved')),
    assigned_to VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);