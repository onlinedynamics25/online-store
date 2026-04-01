CREATE TABLE IF NOT EXISTS downloadable_products (
    download_id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) REFERENCES product(id) ON DELETE CASCADE,
    file_url VARCHAR(500),
    access_limit INT DEFAULT 3,
    expiry_days INT DEFAULT 30
);