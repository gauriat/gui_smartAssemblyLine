const mysql = require('mysql2/promise');
const dbConfig = require('../config/db');

const pool = mysql.createPool(dbConfig);

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const [result] = await pool.query(
            `SELECT COUNT(*) AS dispatchedOrders 
             FROM \`Order\` 
             WHERE status = 'dispatched'`
        );
        const dispatchedOrders = result[0].dispatchedOrders;

        res.status(200).json({ success: true, dispatchedOrders });
    } catch (error) {
        console.error('Error fetching dispatched orders count:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
