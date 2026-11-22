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

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});