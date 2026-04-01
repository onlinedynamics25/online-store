CREATE TABLE IF NOT EXISTS payments (
    payment_id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) REFERENCES orders(order_id),
    payment_method VARCHAR(20) CHECK (payment_method IN ('paystack', 'paypal', 'crypto', 'card')),
    transaction_reference VARCHAR(255),
    crypto_wallet_address VARCHAR(255),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    amount_paid DECIMAL(10,2),
    status VARCHAR(20) CHECK (status IN ('pending', 'success', 'failed'))
);