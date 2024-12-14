const mysql = require('mysql2/promise');
const dbConfig = require('../config/db');

const pool = mysql.createPool(dbConfig);

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const [result] = await pool.query(
            `SELECT COUNT(*) AS pendingOrders 
             FROM \`Order\` 
             WHERE status IN ('new', 'production')`
        );
        const pendingOrders = result[0].pendingOrders;

        res.status(200).json({ success: true, pendingOrders });
    } catch (error) {
        console.error('Error fetching pending orders count:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
