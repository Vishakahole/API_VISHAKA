// middleware/auth.js

const jwt = require('jsonwebtoken');
const pool = require('../Database/database');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).json({ message: "No token provided" });
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(500).json({ message: "Failed to authenticate token" });
        }
        req.userId = decoded.id;
        next();
    });
};

const isAdmin = (req, res, next) => {
    pool.query('SELECT role FROM users WHERE id = ?', [req.userId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Failed to verify user role" });
        }
        if (results[0].role !== 'admin') {
            return res.status(403).json({ message: "Require Admin Role!" });
        }
        next();
    });
};

module.exports = {
    verifyToken,
    isAdmin
};
