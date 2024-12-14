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
                o.Order_ID, 
                o.orderDate, 
                o.status, 
                oi.OrderItem_ID, 
                oi.Quantity, 
                p.Pattern_ID, 
                p.image_path, 
                c.Customer_ID, 
                c.Customer_Name, 
                c.Customer_Email
            FROM 
                \`Order\` o
            JOIN 
                OrderItem oi ON o.Order_ID = oi.Order_ID
            JOIN 
                Pattern p ON oi.Pattern_ID = p.Pattern_ID
            JOIN 
                Customers c ON o.Customer_ID = c.Customer_ID
            WHERE 
                o.status = 'new'
        `;

        const [orders] = await pool.query(query);

        if (orders.length === 0) {
            return res.status(404).json({ success: false, message: 'No new orders found.' });
        }

        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
