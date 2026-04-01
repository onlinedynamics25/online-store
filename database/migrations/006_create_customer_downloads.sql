CREATE TABLE IF NOT EXISTS customer_downloads (
    download_record_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES "user"(id),
    product_id VARCHAR(36) REFERENCES product(id),
    download_token VARCHAR(255),
    downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);