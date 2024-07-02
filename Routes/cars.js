// routes/cars.js

const express = require('express');
const router = express.Router();
const pool = require('../Database/database');
const { verifyToken, isAdmin } = require('../middleware/auth');

// POST /cars/create - Endpoint to add a new car for renting
router.post('/create', verifyToken, isAdmin, function(req, res) {
    const { category, model, number_plate, current_city, rent_per_hr, rent_history } = req.body;

    // Convert rent_history array to JSON string
    const rentHistoryJson = JSON.stringify(rent_history || []);

    // Prepare car data
    const carData = {
        category: category,
        model: model,
        number_plate: number_plate,
        current_city: current_city,
        rent_per_hr: rent_per_hr,
        rent_history: rentHistoryJson
    };

    // Insert into database
    pool.getConnection(function(err, connection) {
        if (err) {
            console.error("Error getting database connection: ", err);
            return res.status(500).json({ message: "Internal Server Error" });
        }

        connection.query('INSERT INTO cars SET ?', carData, function(err, result) {
            connection.release();
            if (err) {
                console.error("Error executing query: ", err);
                return res.status(400).json({ message: "Error adding car", error: err });
            }

            const carId = result.insertId;
            return res.status(200).json({ message: "Car added successfully", car_id: carId });
        });
    });
});

module.exports = router;
