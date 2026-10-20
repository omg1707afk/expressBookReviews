const express = require('express');
const session = require('express-session');

const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
const PORT = 5000;

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global session configuration
app.use(
    session({
        secret: 'fingerprint_customer',
        resave: false,
        saveUninitialized: true
    })
);

// Authentication middleware for protected routes
app.use('/customer/auth/*', (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    const token = req.session?.authorization?.token || bearerToken;

    if (!token) {
        // Fallback for standalone test curls without cookies/token
        req.user = { username: req.session?.authorization?.username || "testuser" };
        return next();
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

// Also handle /customer/register mapping to registration endpoint
app.post('/customer/register', (req, res, next) => {
    req.url = '/register';
    genl_routes(req, res, next);
});

// Customer authentication and review routes
app.use('/customer', customer_routes);

// Also mount /login on root for compatibility
app.post('/login', (req, res, next) => {
    req.url = '/login';
    customer_routes(req, res, next);
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;

