// Routes/users.js

const express = require('express');
const router = express.Router();
const pool = require('../Database/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
function verifyToken(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ error: 1, data: "Token is required" });
    }

    jwt.verify(token, process.env.SECRET_KEY, function(err, decoded) {
        if (err) {
            return res.status(500).json({ error: 1, data: "Failed to authenticate token" });
        }

        req.user = decoded;
        next();
    });
}

// Route: POST /users/register
router.post('/register', async (req, res) => {
    const { user_name, email, password, role } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const userData = {
            user_name: user_name,
            email: email,
            password: hashedPassword,
            role: role || 'user' // Default role as 'user'
        };

        pool.getConnection(function(err, connection) {
            if (err) {
                console.error("Error getting database connection: ", err);
                return res.status(500).json({ error: 1, data: "Internal Server Error" });
            }

            connection.query('INSERT INTO users SET ?', userData, function(err, result) {
                connection.release();
                if (err) {
                    console.error("Error executing query: ", err);
                    return res.status(400).json({ error: 1, data: "Error Occurred!" });
                }

                return res.status(200).json({ error: 0, data: "User registered successfully!" });
            });
        });
    } catch (err) {
        console.error("Error hashing password: ", err);
        return res.status(500).json({ error: 1, data: "Internal Server Error" });
    }
});
// Route: POST /users/login
router.post('/login', function(req, res) {
    const { user_name, password } = req.body;

    pool.getConnection(function(err, connection) {
        if (err) {
            console.error("Error getting database connection: ", err);
            return res.status(500).json({ error: 1, data: "Internal Server Error" });
        }

        connection.query('SELECT * FROM users WHERE user_name = ?', [user_name], async function(err, rows, fields) {
            connection.release();
            if (err) {
                console.error("Error executing query: ", err);
                return res.status(400).json({ error: 1, data: "Error Occurred!" });
            }

            if (rows.length === 0) {
                console.log(`User with username ${user_name} not found`);
                return res.status(404).json({ error: 1, data: "User name does not exist!" });
            }

            const match = await bcrypt.compare(password, rows[0].password);
            if (!match) {
                console.log(`Password mismatch for user ${user_name}`);
                return res.status(401).json({ error: 1, data: "User name and Password do not match" });
            }

            const user = {
                id: rows[0].id,
                user_name: rows[0].user_name,
                email: rows[0].email,
                role: rows[0].role
            };

            const token = jwt.sign(user, process.env.SECRET_KEY, { expiresIn: '1h' });

            return res.status(200).json({ error: 0, token: token, user: user });
        });
    });
});

// Example route accessible only to admins
router.get('/admin/dashboard', verifyToken, function(req, res) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 1, data: "Unauthorized access" });
    }

    res.status(200).json({ message: "Admin Dashboard", user: req.user });
});

module.exports = router;
