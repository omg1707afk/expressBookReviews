
const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({ username, password });
      return res.status(200).json({
        message: "User successfully registered. Now you can login!"
      });
    }

    return res.status(409).json({
      message: "Username already exists"
    });
  }

  return res.status(400).json({
    message: "Username and password are required"
  });
});

// Get all books
public_users.get('/', (req, res) => {
  return res.status(200).json(books);
});

// Get book by ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book);
  }

  return res.status(404).json({ message: "Book not found" });
});

// Get books by author
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author.toLowerCase();

  const result = Object.values(books).filter(
    book => book.author.toLowerCase() === author
  );

  return res.status(200).json(result);
});

// Get books by title
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title.toLowerCase();

  const result = Object.values(books).filter(
    book => book.title.toLowerCase() === title
  );

  return res.status(200).json(result);
});

// Get reviews by ISBN
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];

  if (book) {
    return res.status(200).json(book.reviews || {});
  }

  return res.status(404).json({ message: "Book not found" });
});

module.exports.general = public_users;
