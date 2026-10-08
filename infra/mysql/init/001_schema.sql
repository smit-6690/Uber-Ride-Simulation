CREATE TABLE IF NOT EXISTS rides (
    ride_id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) NOT NULL,
    driver_id VARCHAR(64),
    pickup_latitude DECIMAL(10, 7) NOT NULL,
    pickup_longitude DECIMAL(10, 7) NOT NULL,
    dropoff_latitude DECIMAL(10, 7) NOT NULL,
    dropoff_longitude DECIMAL(10, 7) NOT NULL,
    status ENUM('requested', 'accepted', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'requested',
    estimated_price DECIMAL(10, 2),
    actual_price DECIMAL(10, 2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_rides_driver_status (driver_id, status),
    INDEX idx_rides_customer_created (customer_id, created_at)
);

CREATE TABLE IF NOT EXISTS billing_records (
    billing_id VARCHAR(64) PRIMARY KEY,
    ride_id VARCHAR(64) NOT NULL,
    customer_id VARCHAR(64) NOT NULL,
    driver_id VARCHAR(64),
    amount DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_billing_ride FOREIGN KEY (ride_id) REFERENCES rides(ride_id),
    INDEX idx_billing_customer_created (customer_id, created_at)
);
