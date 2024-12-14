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
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ success: false, message: 'Customer ID is required' });
    }

    try {
        const query = 'SELECT * FROM Pattern WHERE Customer_ID = ?';
        const [patterns] = await pool.query(query, [userId]);

        res.status(200).json({ success: true, patterns });
    } catch (error) {
        console.error('Error fetching patterns:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
