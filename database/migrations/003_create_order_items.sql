CREATE TABLE IF NOT EXISTS order_items (
    order_item_id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id VARCHAR(36) REFERENCES product(id),  -- Medusa product
    quantity INT,
    price DECIMAL(10,2)  -- snapshot price
);