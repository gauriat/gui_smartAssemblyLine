const mysql = require('mysql2/promise');
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');

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

    const form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname, '../uploads');
    form.keepExtensions = true;

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error('Form parse error:', err);
            return res.status(500).json({ success: false, message: 'File upload error' });
        }

        const { userId } = fields;
        const file = files.file;

        if (!userId || !file) {
            return res.status(400).json({ success: false, message: 'User ID and file are required' });
        }

        try {
            // Create customer-specific folder
            const customerFolderPath = path.join(form.uploadDir, `customer_${userId}`);
            if (!fs.existsSync(customerFolderPath)) {
                fs.mkdirSync(customerFolderPath, { recursive: true });
            }

            // Move the uploaded file
            const filePath = path.join(customerFolderPath, file.name);
            fs.renameSync(file.path, filePath);

            // Insert into database
            const query = 'INSERT INTO Pattern (Customer_ID, image_path, UpdatedDate) VALUES (?, ?, CURDATE())';
            await pool.query(query, [userId, filePath]);

            res.status(200).json({ success: true });
        } catch (error) {
            console.error('Error inserting pattern:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    });
};
