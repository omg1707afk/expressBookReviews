const express = require('express');
const jwt = require('jsonwebtoken');
let books = require('./booksdb.js');

const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    return userswithsamename.length > 0;
};

const authenticatedUser = (username, password) => {
    let matchingusers = users.filter((user) => {
        return user.username === username && user.password === password;
    });
    return matchingusers.length > 0;
};

// =================================================================
// Task 7: Registered users can log in
// =================================================================
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

// =================================================================
// Task 8: Add or update a book review
// =================================================================
regd_users.put('/auth/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review || req.query.review;
    const username = req.session?.authorization?.username || req.user?.username || "testuser";

    if (!review) {
        return res.status(400).json({
            message: 'Review is required'
        });
    }

    const book = books[isbn];
    if (!book) {
        return res.status(404).json({
            message: `Book with ISBN ${isbn} not found`
        });
    }

    if (!book.reviews) {
        book.reviews = {};
    }

    book.reviews[username] = review;

    return res.status(200).json({
        message: 'Review updated successfully',
        reviews: book.reviews
    });
});

// =================================================================
// Task 9: Delete a book review
// =================================================================
regd_users.delete('/auth/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session?.authorization?.username || req.user?.username || "testuser";

    const book = books[isbn];
    if (!book) {
        return res.status(404).json({
            message: `Book with ISBN ${isbn} not found`
        });
    }

    if (book.reviews && book.reviews[username]) {
        delete book.reviews[username];
        return res.status(200).json({
            message: `Review for ISBN ${isbn} deleted successfully`
        });
    } else {
        return res.status(404).json({
            message: `Review for ISBN ${isbn} by user ${username} not found`
        });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
