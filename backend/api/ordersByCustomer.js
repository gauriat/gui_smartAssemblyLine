const mysql = require('mysql2/promise');
const dbConfig = require('../config/db');

const pool = mysql.createPool(dbConfig);

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const query = `
            SELECT c.Customer_Name, COUNT(o.Order_ID) AS orderCount
            FROM \`Order\` o
            JOIN Customers c ON o.Customer_ID = c.Customer_ID
            GROUP BY c.Customer_Name
        `;
        const [results] = await pool.query(query);

        res.status(200).json({ success: true, ordersByCustomer: results });
    } catch (error) {
        console.error('Error fetching orders by customer:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
