const mysql = require('mysql2/promise');
const dbConfig = require('../config/db'); // Your DB config

const pool = mysql.createPool(dbConfig);

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    try {
        const query = `
            SELECT 
                o.Order_ID,
                oi.OrderItem_ID,
                oi.Quantity,
                p.Pattern_ID,
                p.image_path,
                o.orderDate,
                d.Date AS dispatched_time
            FROM 
                \`Order\` o
            JOIN 
                OrderItem oi ON o.Order_ID = oi.Order_ID
            JOIN 
                Pattern p ON oi.Pattern_ID = p.Pattern_ID
            LEFT JOIN 
                Product prod ON oi.OrderItem_ID = prod.OrderItem_ID
            LEFT JOIN 
                Dispatch d ON prod.Product_ID = d.Product_ID
            WHERE 
                o.Customer_ID = ?
        `;

        const [orders] = await pool.query(query, [userId]);

        if (orders.length === 0) {
            return res.status(404).json({ success: false, message: 'No orders found for this user.' });
        }

        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
