
const express = require('express');
const jwt = require('jsonwebtoken');
let books = require('./booksdb.js');

const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
    return users.some(
        user => user.username === username && user.password === password
    );
};

// Registered users can log in
regd_users.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: 'Username and password are required'
        });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({
            message: 'Invalid username or password'
        });
    }

    const token = jwt.sign(
        { username },
        'access',
        { expiresIn: '1h' }
    );

    req.session.authorization = {
        token,
        username
    };

    return res.status(200).json({
        message: 'Login successful!',
        token
    });
});

// Add or update a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
    const { isbn } = req.params;
    const { review } = req.body;
    const username = req.session?.authorization?.username;

    if (!username) {
        return res.status(401).json({
            message: 'Please login first'
        });
    }

    const book = books[isbn];

    if (!book) {
        return res.status(404).json({
            message: 'Book not found'
        });
    }

    if (!review) {
        return res.status(400).json({
            message: 'Review is required'
        });
    }

    if (!book.reviews) {
        book.reviews = {};
    }

    book.reviews[username] = review;

    return res.status(200).json({
        message: 'Review added successfully',
        reviews: book.reviews
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
