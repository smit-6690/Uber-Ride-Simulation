const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'mysql',
    port: Number(process.env.MYSQL_PORT || 3306),
    database: process.env.MYSQL_DATABASE || 'uber_simulation',
    user: process.env.MYSQL_USER || 'uber_app',
    password: process.env.MYSQL_PASSWORD || 'uber_password',
    waitForConnections: true,
    connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT || 10),
    queueLimit: 0
});

function mysqlRequired() {
    return process.env.MYSQL_REQUIRED === 'true';
}

function normalizeStatus(status) {
    return status === 'in-progress' ? 'in_progress' : status;
}

async function run(operation, context) {
    try {
        return await operation();
    } catch (error) {
        console.error(`[MYSQL ${context}]`, error.message);
        if (mysqlRequired()) throw error;
        return null;
    }
}

async function syncRideToMySQL(ride) {
    return run(async () => {
        await pool.execute(
            `INSERT INTO rides
                (ride_id, customer_id, driver_id, pickup_latitude, pickup_longitude,
                 dropoff_latitude, dropoff_longitude, status, estimated_price, actual_price)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                customer_id = VALUES(customer_id),
                driver_id = VALUES(driver_id),
                pickup_latitude = VALUES(pickup_latitude),
                pickup_longitude = VALUES(pickup_longitude),
                dropoff_latitude = VALUES(dropoff_latitude),
                dropoff_longitude = VALUES(dropoff_longitude),
                status = VALUES(status),
                estimated_price = VALUES(estimated_price),
                actual_price = VALUES(actual_price)`,
            [
                ride.rideId,
                ride.customerId,
                ride.driverId || null,
                ride.pickupLocation.latitude,
                ride.pickupLocation.longitude,
                ride.dropoffLocation.latitude,
                ride.dropoffLocation.longitude,
                normalizeStatus(ride.status || 'requested'),
                ride.estimatedPrice ?? null,
                ride.actualPrice ?? null
            ]
        );
    }, `RIDE ${ride.rideId}`);
}

async function syncRideStatusToMySQL(ride) {
    return run(async () => {
        await pool.execute(
            `UPDATE rides
             SET status = ?, estimated_price = ?, actual_price = ?
             WHERE ride_id = ?`,
            [
                normalizeStatus(ride.status),
                ride.estimatedPrice ?? null,
                ride.actualPrice ?? null,
                ride.rideId
            ]
        );
    }, `RIDE STATUS ${ride.rideId}`);
}

async function checkMySQLConnection() {
    return run(async () => {
        await pool.query('SELECT 1');
        console.log('✅ MySQL connection ready (rides-service)');
    }, 'CONNECTION');
}

module.exports = { checkMySQLConnection, syncRideToMySQL, syncRideStatusToMySQL };
