require("dotenv").config();

const express = require("express");
const path = require("path");
const { Pool } = require("pg");

const app = express();
const PORT = 3000;

// Database connection
const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/js", express.static(path.join(__dirname, "js")));

// Dashboard homepage
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Test database connection
app.get("/test-db", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT COUNT(*) FROM customers"
        );

        res.json({
            message: "Database connected successfully!",
            customers: Number(result.rows[0].count)
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            error: "Database connection failed"
        });
    }
});

 // Get dashboard data from PostgreSQL
app.get("/api/dashboard", async (req, res) => {
    try {
        // Customer pagination
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = 10;
        const offset = (page - 1) * limit;

        // 1. Total customers
        const customerCount = await pool.query(
            "SELECT count(*) FROM customers"
        );

        // 2. Customers with pagination
        const customers = await pool.query(
            "SELECT * FROM customers ORDER BY id LIMIT $1 OFFSET $2",
            [limit, offset]
        );

        // 3. Total revenue
        const revenue = await pool.query(
            "SELECT sum(saleamount) FROM sales"
        );

        // 4. Sales with product names
        const sales = await pool.query(`
            SELECT products.name, sales.quantity, sales.saleamount
            FROM sales
            LEFT JOIN products ON sales.productid = products.id
            ORDER BY sales.id ASC
        `);

        // 5. Total orders
        const orders = await pool.query(
            "SELECT count(quantity) FROM orders"
        );

        // 6. Total issues
        const issueCount = await pool.query(
            "SELECT count(id) FROM alerts WHERE type = 'issues'"
        );

        // 7. Issue records
        const issues = await pool.query(
            "SELECT * FROM alerts WHERE type = 'issues'"
        );

        // 8. Total notifications
        const notificationCount = await pool.query(
            "SELECT count(id) FROM alerts WHERE type = 'notifications'"
        );

        // 9. Notification records
        const notifications = await pool.query(
            "SELECT * FROM alerts WHERE type = 'notifications'"
        );

        // 10. Task records
        const tasks = await pool.query(
            "SELECT * FROM alerts WHERE type = 'tasks'"
        );

        res.json({
            customerCount: Number(customerCount.rows[0].count),
            customers: customers.rows,
            revenue: Number(revenue.rows[0].sum || 0),
            sales: sales.rows,
            orders: Number(orders.rows[0].count),
            issueCount: Number(issueCount.rows[0].count),
            issues: issues.rows,
            notificationCount: Number(notificationCount.rows[0].count),
            notifications: notifications.rows,
            tasks: tasks.rows,
            page: page,
            totalPages: Math.ceil(
                Number(customerCount.rows[0].count) / limit
            )
        });

    } catch (error) {
        console.error("Dashboard error:", error.message);
        res.status(500).json({
            error: "Failed to load dashboard data"
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});