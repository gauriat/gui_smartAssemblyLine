const mysql = require('mysql2/promise');
const dbConfig = require('../config/db');

const pool = mysql.createPool(dbConfig);

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const query = `
            SELECT 
                DATE(orderDate) AS orderDate, 
                COUNT(*) AS orderCount 
            FROM \`Order\` 
            GROUP BY DATE(orderDate) 
            ORDER BY orderDate ASC
        `;
        const [ordersPerDay] = await pool.query(query);

        res.status(200).json({ success: true, ordersPerDay });
    } catch (error) {
        console.error('Error fetching orders per day:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
