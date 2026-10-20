
const express = require('express');
const session = require('express-session');

const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
const PORT = 5000;

// Parse JSON request bodies
app.use(express.json());

// Session configuration for customer routes
app.use(
    '/customer',
    session({
        secret: 'fingerprint_customer',
        resave: false,
        saveUninitialized: false
    })
);

// Authentication middleware for protected routes
app.use('/customer/auth/*', (req, res, next) => {
    const token = req.session?.authorization?.token;

    if (!token) {
        return res.status(401).json({
            message: 'Authentication required. Please login first.'
        });
    }

    const jwt = require('jsonwebtoken');

    jwt.verify(token, 'access', (err, user) => {
        if (err) {
            return res.status(403).json({
                message: 'Invalid or expired token.'
            });
        }

        req.user = user;
        next();
    });
});

// Public book routes
app.use('/', genl_routes);

// Customer authentication and review routes
app.use('/customer', customer_routes);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
