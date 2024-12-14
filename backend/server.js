const express = require('express');
const mysql = require('mysql2/promise'); // Use mysql2 with promises
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(cors());
app.use((req,res,next) => {
    console.log(`${req.method} ${req.url}`);
    next();
})
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection setup with pooling
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Gui@2024',
    database: 'smartassemblyline',
    connectionLimit:1000
};

// Create a pool to manage multiple connections
const pool = mysql.createPool(dbConfig);

// Middleware for handling database connection errors
app.use(async (req, res, next) => {
    try {
        req.db = await pool.getConnection();
        next();
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ success: false, message: 'Database connection failed' });
    }
});

// File storage setup for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.post('/login', async (req, res) => {
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
});

// Add pattern route
app.post('/addPattern', upload.single('image'), async (req, res) => {
    const userId = req.body.userId;
    const image = req.file;

    // Define folder path based on Customer_ID
    const customerFolderPath = path.join(__dirname, 'uploads', `customer_${userId}`);

    if (!fs.existsSync(customerFolderPath)) {
        fs.mkdirSync(customerFolderPath, { recursive: true });
    }

    // Define the full path for storing the image
    const imagePath = path.join(customerFolderPath, image.originalname);

    try {
        fs.renameSync(image.path, imagePath);

        const query = 'INSERT INTO Pattern (Customer_ID, image_path, UpdatedDate) VALUES (?, ?, CURDATE())';
        await req.db.query(query, [userId, imagePath]);

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error inserting pattern:', error);
        res.status(500).json({ success: false });
    }
});

// View patterns route
app.get('/viewPatterns', async (req, res) => {
    const customerId = req.query.userId; // Updated to match Customer_ID

    if (!customerId) {
        return res.status(400).json({ success: false, message: 'Customer ID is required' });
    }

    try {
        const query = 'SELECT * FROM Pattern WHERE Customer_ID = ?';
        const [patterns] = await req.db.query(query, [customerId]);

        // Log results for debugging
        console.log('Patterns fetched:', patterns);

        res.json({ success: true, patterns });
    } catch (error) {
        console.error('Error fetching patterns:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// View patterns route
app.get('/patterns', async (req, res) => {
    try {
        const query = 'SELECT * FROM Pattern';
        const [patterns] = await req.db.query(query);

        if (patterns.length === 0) {
            return res.status(404).json({ success: false, message: 'No patterns found' });
        }

        res.json({ success: true, patterns });
    } catch (error) {
        console.error('Error fetching patterns:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Place Order API
app.post('/placeOrder', async (req, res) => {
    const { userId, cartItems } = req.body; // cartItems: [{ idPattern, quantity }]

    if (!userId || !cartItems || cartItems.length === 0) {
        return res.status(400).json({ success: false, message: 'User ID and cart items are required' });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Step 1: Insert into `Order` table with `status` set to 'new'
        const [orderResult] = await connection.query(
            'INSERT INTO `Order` (Customer_ID, orderDate, status) VALUES (?, NOW(), ?)', 
            [userId, 'new'] // Setting the status as 'new'
        );
        const orderId = orderResult.insertId;

        // Step 2: Insert each cart item into OrderItem table
        for (const item of cartItems) {
            const { idPattern, quantity } = item;

            // Insert into OrderItem
            await connection.query(
                'INSERT INTO OrderItem (Order_ID, Pattern_ID, Quantity) VALUES (?, ?, ?)',
                [orderId, idPattern, quantity]
            );
        }

        // Commit transaction
        await connection.commit();

        res.status(200).json({ success: true, message: 'Order placed successfully', orderId });
    } catch (error) {
        if (connection) await connection.rollback(); // Rollback on error
        console.error('Error placing order:', error);
        res.status(500).json({ success: false, message: 'Error placing order' });
    } finally {
        if (connection) connection.release();
    }
});

//view orders
app.get('/viewOrders', async (req, res) => {
    const userId = req.query.userId;

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
});

// Total orders count
app.get('/totalOrdersCount', async (req, res) => {
    try {
        const [result] = await req.db.query(`SELECT COUNT(*) AS totalOrders FROM \`Order\``);
        const totalOrders = result[0].totalOrders;

        res.status(200).json({ success: true, totalOrders });
    } catch (error) {
        console.error('Error fetching total orders count:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Count Pending Orders (status: new and production)
app.get('/pendingOrdersCount', async (req, res) => {
    try {
        const [result] = await req.db.query(
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
});

// Count Dispatched Orders (status: dispatched)
app.get('/dispatchedOrdersCount', async (req, res) => {
    try {
        const [result] = await req.db.query(
            `SELECT COUNT(*) AS dispatchedOrders 
             FROM \`Order\` 
             WHERE status = 'dispatched'`
        );
        const dispatchedOrders = result[0].dispatchedOrders;

        res.status(200).json({ success: true, dispatchedOrders });
    } catch (error) {
        console.error('Error fetching dispatched orders count:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.get('/totalOrdersCount', async (req, res) => {
    try {
        const [result] = await req.db.query(`SELECT COUNT(*) AS totalOrders FROM \`Order\``);
        const totalOrders = result[0].totalOrders;

        res.status(200).json({ success: true, totalOrders });
    } catch (error) {
        console.error('Error fetching total orders count:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Orders count by customer
app.get('/ordersByCustomer', async (req, res) => {
    try {
        const query = `
            SELECT c.Customer_Name, COUNT(o.Order_ID) AS orderCount
            FROM \`Order\` o
            JOIN Customers c ON o.Customer_ID = c.Customer_ID
            GROUP BY c.Customer_Name
        `;
        const [results] = await req.db.query(query);

        res.status(200).json({ success: true, ordersByCustomer: results });
    } catch (error) {
        console.error('Error fetching orders by customer:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.get('/ordersPerDay', async (req, res) => {
    try {
        const query = `
            SELECT 
                DATE(orderDate) AS orderDate, 
                COUNT(*) AS orderCount 
            FROM \`Order\` 
            GROUP BY DATE(orderDate) 
            ORDER BY orderDate ASC
        `;
        const [ordersPerDay] = await req.db.query(query);

        res.status(200).json({ success: true, ordersPerDay });
    } catch (error) {
        console.error('Error fetching orders per day:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get all orders with status 'new'
app.get('/orders', async (req, res) => {
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
                o.status = 'new'; -- Filter orders with status 'new'
        `;

        const [orders] = await req.db.query(query);

        if (orders.length === 0) {
            return res.status(404).json({ success: false, message: 'No new orders found.' });
        }

        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Prioritized rack lists based on nearest to farthest logic
const rackPriorityRM = [
    'RM_01', 'RM_02', 'RM_03', 'RM_04', 'RM_05', 'RM_06',
    'RM_07', 'RM_08', 'RM_09', 'RM_10', 'RM_11', 'RM_12',
    'RM_13', 'RM_14', 'RM_15', 'RM_16', 'RM_17', 'RM_18',
    'RM_19', 'RM_20', 'RM_21', 'RM_22', 'RM_23', 'RM_24'
];

const rackPriorityFG = [
    'FG_01', 'FG_02', 'FG_03', 'FG_04', 'FG_05', 'FG_06',
    'FG_07', 'FG_08', 'FG_09', 'FG_10', 'FG_11', 'FG_12',
    'FG_13', 'FG_14', 'FG_15', 'FG_16', 'FG_17', 'FG_18',
    'FG_19', 'FG_20', 'FG_21', 'FG_22', 'FG_23', 'FG_24'
];

const findEmptyRack = async (req, rackPriority, rackType) => {
    try {
        for (let rack of rackPriority) {
            const [result] = await req.db.query(
                'SELECT status FROM Rack WHERE Rack_ID = ? AND ASRS_ID = ?', 
                [rack, rackType]
            );

            if (rackType === 1 && result[0]?.status === 'filled') {
                await req.db.query(
                    'UPDATE Rack SET status = "empty" WHERE Rack_ID = ? AND ASRS_ID = ?', 
                    [rack, rackType]
                );
                return rack;
            } else if (rackType === 2 && result[0]?.status === 'empty') {
                await req.db.query(
                    'UPDATE Rack SET status = "filled" WHERE Rack_ID = ? AND ASRS_ID = ?', 
                    [rack, rackType]
                );
                return rack;
            }
            console.log(rack);
        }
        return null;
    } catch (err) {
        console.error(`Error finding rack for type ${rackType}:`, err);
        return null;
    }
};

app.post('/startProduction', async (req, res) => {
    const { orderId, operatorId } = req.body;

    try {
        // Fetch the Customer ID for the given Order ID
        const [orders] = await req.db.query(
            'SELECT Customer_ID FROM `Order` WHERE Order_ID = ?',
            [orderId]
        );
        if (orders.length === 0) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        const customerId = orders[0].Customer_ID;

        // Fetch Order Item ID for the given Order ID
        const [orderItems] = await req.db.query(
            'SELECT OrderItem_ID FROM OrderItem WHERE Order_ID = ?',
            [orderId]
        );
        if (orderItems.length === 0) {
            return res.status(404).json({ success: false, message: 'Order item not found' });
        }
        const item = orderItems[0];

        // Find empty racks for RM and FG
        const rackRM = await findEmptyRack(req, rackPriorityRM, 1);
        const rackFG = await findEmptyRack(req, rackPriorityFG, 2);

        console.log('rm:', rackRM, "fg:", rackFG);
        if (!rackRM || !rackFG) {
            return res.status(500).json({ success: false, message: 'No available racks' });
        }

        // Fetch Process ID
        const [proc] = await req.db.query('SELECT Process_ID FROM Process');
        const procId = proc[0];
        console.log(procId);

        // Insert into Production table
        const [insertResult] = await req.db.query(
            'INSERT INTO Production (OrderItem_ID, Order_ID, Customer_ID, Operator_ID, Process_ID, StartedDate, LastWorked, Rack_RM, Rack_FG) VALUES (?, ?, ?, ?, ?, NOW(), NOW(), ?, ?)',
            [item.OrderItem_ID, orderId, customerId, operatorId, procId.Process_ID, rackRM, rackFG]
        );

        const prodId = insertResult.insertId;
        console.log(prodId);

        // Update the status of the order to 'production'
        await req.db.query(
            'UPDATE `Order` SET status = ? WHERE Order_ID = ?',
            ['production', orderId]
        );

        res.status(200).json({
            success: true,
            message: 'Production started successfully',
            productionId: prodId
        });
    } catch (error) {
        console.error('Error starting production:', error);
        res.status(500).json({ success: false, message: 'Failed to start production' });
    }
});

//Fetches Rack Status
app.get('/getRackStatusFG', async (req, res) => {
    try {
        // console.log(req.db);
        const [racks] = await req.db.query('SELECT Rack_ID, rowNumber, colNumber, status FROM Rack WHERE ASRS_ID = 2');
        // console.log(racks);
        res.status(200).json({ success: true, data: racks });
    } catch (error) {
        console.error('Error fetching rack status:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch rack status' });
    }
});

//Fetches Rack Status
app.get('/getRackStatus', async (req, res) => {
    try {
        // console.log(req.db);
        const [racks] = await req.db.query('SELECT Rack_ID, rowNumber, colNumber, status FROM Rack WHERE ASRS_ID = 1');
        // console.log(racks);
        res.status(200).json({ success: true, data: racks });
    } catch (error) {
        console.error('Error fetching rack status:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch rack status' });
    }
});

//Update Rack Status
app.post('/updateRackStatus', async (req, res) => {
    const { rackID, status } = req.body;

    try {
        const [result] = await req.db.query(
            'UPDATE Rack SET status = ? WHERE Rack_ID = ? AND ASRS_ID=1',
            [status, rackID]
        );

        if (result.affectedRows > 0) {
            console.log("done");
            res.json({ success: true, message: 'Rack status updated successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Rack not found' });
        }
    } catch (error) {
        console.error('Error updating rack status:', error);
        res.status(500).json({ success: false, message: 'Failed to update rack status' });
    }
});

app.post('/updateMachineStatus', async (req, res) => {
    const { machineId, status, startTime, endTime } = req.body;

    try {
        if (status === 'Running') {
            await req.db.query(
                'UPDATE Machine SET Status = ?, StartTime = ? WHERE Machine_ID = ?',
                [status, startTime, machineId]
            );
        } else if (status === 'Idle') {
            await req.db.query(
                'UPDATE Machine SET Status = ?, EndTime = ? WHERE Machine_ID = ?',
                [status, endTime, machineId]
            );
        }
        res.send({ success: true });
    } catch (error) {
        console.error('Error updating machine status:', error);
        res.status(500).send({ success: false, message: 'Failed to update machine status.' });
    }
});

// API endpoint to get all production details
app.get('/allProductionDetails', async (req, res) => {
    const query = `
        SELECT 
            p.Production_ID,
            p.OrderItem_ID,
            p.Order_ID,
            p.Customer_ID,
            p.Operator_ID,
            p.Process_ID,
            p.StartedDate,
            p.LastWorked,
            p.Rack_RM,
            p.Rack_FG,
            pr.ProcessName,
            op.OperationName,
            m.Machine_ID,
            m.Machine_Name,
            m.Status AS Machine_Status,
            m.StartTime AS Machine_StartTime,
            m.EndTime AS Machine_EndTime,
            d.Dispatch_ID,
            d.Product_ID,
            d.Date AS Dispatch_Date
        FROM 
            Production p
        INNER JOIN Process pr ON p.Process_ID = pr.Process_ID
        INNER JOIN Operation op ON pr.Process_ID = op.Process_ID
        INNER JOIN Machine m ON op.Machine_ID = m.Machine_ID
        LEFT JOIN Dispatch d ON p.Production_ID = d.Product_ID
        ORDER BY p.Production_ID, pr.ProcessName, m.Machine_ID;
    `;


    try {
        console.log('Executing query:', query); // Debugging log
        const [results] = await req.db.query(query); // Execute query

        if (results.length === 0) {
            return res.status(404).send({ success: false, message: 'No production details found.' });
        }

        // Optionally, group machines by production ID and process name if required
        const groupedResults = results.reduce((acc, item) => {
            const key = `${item.Production_ID}_${item.ProcessName}`;
            if (!acc[key]) {
                acc[key] = {
                    Production_ID: item.Production_ID,
                    OrderItem_ID: item.OrderItem_ID,
                    Order_ID: item.Order_ID,
                    Customer_ID: item.Customer_ID,
                    Operator_ID: item.Operator_ID,
                    Process_ID: item.Process_ID,
                    ProcessName: item.ProcessName,
                    StartedDate: item.StartedDate,
                    LastWorked: item.LastWorked,
                    Rack_RM: item.Rack_RM,
                    Rack_FG: item.Rack_FG,
                    Machines: [],
                    Dispatch_ID: item.Dispatch_ID || null,
                    Product_ID: item.Product_ID || null,
                    Dispatch_Date: item.Dispatch_Date || null,
                    Order_Status: item.Dispatch_ID ? 'dispatched' : 'in-progress',
                };
            }
            acc[key].Machines.push({
                Machine_ID: item.Machine_ID,
                Machine_Name: item.Machine_Name,
                Machine_Status: item.Machine_Status,
                Machine_StartTime: item.Machine_StartTime,
                Machine_EndTime: item.Machine_EndTime,
            });
            return acc;
        }, {});        

        res.status(200).send({
            success: true,
            data: Object.values(groupedResults), // Return grouped data
        });
    } catch (err) {
        console.error('Error fetching all production details:', err);
        res.status(500).send({ success: false, message: 'Error fetching all production details' });
    }
});

app.post('/resumeProd', async (req, res) => {
    const { productionId } = req.body;
    console.log(productionId);
    const status= 'production';

    if (!productionId) {
        return res.status(400).json({ message: 'Production ID is required.' });
    }
    await req.db.query(
        'UPDATE Production SET status =?, LastWorked = NOW() WHERE Production_ID = ?',
        [status, productionId]
    );
        console.log(`Production with ID ${productionId} resumed.`);
        res.status(200).json({ message: `Production with ID ${productionId} resumed successfully!` });
});

// Stop production endpoint
app.post('/stopProduction', async (req, res) => {
    const { productionId } = req.body;
    console.log(productionId);
    const status= 'stopped';

    if (!productionId) {
        return res.status(400).json({ message: 'Production ID is required.' });
    }

    await req.db.query(
        'UPDATE Production SET status = ?, LastWorked = NOW() WHERE Production_ID = ?',
        [status,productionId]
    );      
        console.log(`Production with ID ${productionId} stopped.`);
        res.status(200).json({ message: `Production with ID ${productionId} stopped successfully!` });
});

app.post('/dispatchProduct', async (req, res) => {
    const { productionId, orderId, orderItemId, customerId, rackFg } = req.body;

    try {
        // Insert into Product table
        const [productResult] = await req.db.query(
            'INSERT INTO Product (Order_ID, OrderItem_ID, Customer_ID) VALUES (?, ?, ?)',
            [orderId, orderItemId, customerId]
        );

        const productId = productResult.insertId;

        // Insert into Dispatch table
        await req.db.query(
            'INSERT INTO Dispatch (Product_ID, Date) VALUES (?, CURDATE())',
            [productId]
        );

        // Update Order table status
        await req.db.query(
            'UPDATE `Order` SET status = "dispatched" WHERE Order_ID = ?',
            [orderId]
        );

        // Update Rack FG status
        await req.db.query(
            'UPDATE Rack SET status = "empty" WHERE Rack_ID = ?',
            [rackFg]
        );

        res.status(200).json({ success: true, message: 'Product dispatched successfully.' });
    } catch (error) {
        console.error('Error during dispatch operation:', error);
        res.status(500).json({ success: false, message: 'Failed to dispatch product.' });
    }
});

// Start the server
app.listen(8081, () => {
    console.log('Server is running on http://localhost:8081');
});
