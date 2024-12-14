const mysql = require('mysql2/promise');
const dbConfig = require('../config/db');

const pool = mysql.createPool(dbConfig);

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const [result] = await pool.query(`SELECT COUNT(*) AS totalOrders FROM \`Order\``);
        const totalOrders = result[0].totalOrders;

        res.status(200).json({ success: true, totalOrders });
    } catch (error) {
        console.error('Error fetching total orders count:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
