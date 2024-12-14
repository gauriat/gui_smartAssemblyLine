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

    const { username, password } = req.body;

    try {
        const [rows] = await pool.query(
            'SELECT Customer_ID AS id, Customer_type FROM Customers WHERE Customer_Name = ? AND Customer_Password = ?',
            [username, password]
        );

        if (rows.length > 0) {
            const { id, Customer_type: userType } = rows[0];
            return res.status(200).json({ success: true, userId: id, userType });
        } else {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Database error during login:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
