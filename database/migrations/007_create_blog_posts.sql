CREATE TABLE IF NOT EXISTS blog_posts (
    post_id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(200),
    content TEXT,
    category VARCHAR(20) CHECK (category IN ('study-abroad', 'migration', 'visa-tips')),
    author_id VARCHAR(36) REFERENCES "user"(id),
    views INT DEFAULT 0,
    published_at TIMESTAMP
);