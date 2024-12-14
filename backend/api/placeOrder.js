const mysql = require('mysql2/promise');
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 1000,
};

const pool = mysql.createPool(dbConfig);

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { userId, cartItems } = req.body; // cartItems: [{ idPattern, quantity }]

    if (!userId || !cartItems || cartItems.length === 0) {
        return res.status(400).json({ success: false, message: 'User ID and cart items are required' });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Insert into `Order` table
        const [orderResult] = await connection.query(
            'INSERT INTO `Order` (Customer_ID, orderDate, status) VALUES (?, NOW(), ?)', 
            [userId, 'new']
        );
        const orderId = orderResult.insertId;

        // Insert each item into `OrderItem`
        for (const item of cartItems) {
            const { idPattern, quantity } = item;
            await connection.query(
                'INSERT INTO OrderItem (Order_ID, Pattern_ID, Quantity) VALUES (?, ?, ?)',
                [orderId, idPattern, quantity]
            );
        }

        await connection.commit();
        res.status(200).json({ success: true, message: 'Order placed successfully', orderId });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error placing order:', error);
        res.status(500).json({ success: false, message: 'Error placing order' });
    } finally {
        if (connection) connection.release();
    }
};
