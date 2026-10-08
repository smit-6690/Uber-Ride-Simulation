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

function paymentStatus(status) {
    if (status === 'completed') return 'paid';
    if (status === 'failed') return 'failed';
    if (status === 'refunded') return 'refunded';
    return 'pending';
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

async function syncBillingToMySQL(billing, rideData) {
    return run(async () => {
        await pool.execute(
            `INSERT INTO billing_records
                (billing_id, ride_id, customer_id, driver_id, amount, payment_status)
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                customer_id = VALUES(customer_id),
                driver_id = VALUES(driver_id),
                amount = VALUES(amount),
                payment_status = VALUES(payment_status)`,
            [
                billing.billingId,
                rideData.rideId,
                billing.customerId,
                billing.driverId || null,
                billing.actualPrice ?? billing.totalAmount ?? billing.predictedPrice ?? 0,
                paymentStatus(billing.status)
            ]
        );
    }, `BILLING ${rideData.rideId}`);
}

async function syncBillingStatusToMySQL(billing) {
    return run(async () => {
        await pool.execute(
            `UPDATE billing_records SET payment_status = ? WHERE billing_id = ?`,
            [paymentStatus(billing.status), billing.billingId]
        );
    }, `BILLING STATUS ${billing.billingId}`);
}

async function checkMySQLConnection() {
    return run(async () => {
        await pool.query('SELECT 1');
        console.log('✅ MySQL connection ready (billing-service)');
    }, 'CONNECTION');
}

module.exports = { checkMySQLConnection, syncBillingToMySQL, syncBillingStatusToMySQL };
