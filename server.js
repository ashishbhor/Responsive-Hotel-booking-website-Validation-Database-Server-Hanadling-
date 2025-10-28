const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory "database" for demo purposes
let bookings = [];

// API Routes
app.post('/api/bookings', (req, res) => {
    const booking = req.body;
    
    // Simple validation
    if (!booking.email || !booking.name || !booking.checkIn || !booking.checkOut) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Add ID and timestamp
    booking.id = Date.now();
    booking.createdAt = new Date();
    
    // Add to "database"
    bookings.push(booking);
    
    res.status(201).json({
        message: 'Booking created successfully',
        booking: booking
    });
});

app.get('/api/bookings', (req, res) => {
    res.json(bookings);
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
}

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});