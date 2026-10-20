const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

// =================================================================
// Task 6: Register a new user
// =================================================================
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

// =================================================================
// Task 1 & Task 10: Get the list of books available in the shop
// Using Promise callbacks & async-await with Axios
// =================================================================
const getBookListWithAxios = async () => {
  try {
    const response = await axios.get('http://localhost:5000/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Error fetching books with Axios');
  }
};

public_users.get('/', async function (req, res) {
  try {
    const getBooks = new Promise((resolve, reject) => {
      if (books) {
        resolve(books);
      } else {
        reject({ status: 404, message: "No books found" });
      }
    });

    const bookList = await getBooks;
    return res.status(200).send(JSON.stringify(bookList, null, 4));
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Failed to retrieve books"
    });
  }
});

// =================================================================
// Task 2 & Task 11: Get book details based on ISBN
// Using Promise callbacks & async-await with Axios
// =================================================================
const getBookByISBNWithAxios = (isbn) => {
  return new Promise((resolve, reject) => {
    axios.get(`http://localhost:5000/isbn/${isbn}`)
      .then((response) => {
        if (response.data) {
          resolve(response.data);
        } else {
          reject({ status: 404, message: `Book with ISBN ${isbn} not found` });
        }
      })
      .catch((error) => {
        const status = error.response ? error.response.status : 500;
        const message = error.response?.data?.message || error.message || 'Error fetching book by ISBN';
        reject({ status, message });
      });
  });
};

public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const getBook = new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject({ status: 404, message: `Book with ISBN ${isbn} not found` });
    }
  });

  getBook
    .then((book) => {
      return res.status(200).send(JSON.stringify(book, null, 4));
    })
    .catch((error) => {
      return res.status(error.status || 404).json({
        message: error.message
      });
    });
});

// =================================================================
// Task 3 & Task 12: Get book details based on author
// Using Promise callbacks & async-await with Axios
// =================================================================
const getBooksByAuthorWithAxios = async (author) => {
  try {
    const response = await axios.get(`http://localhost:5000/author/${encodeURIComponent(author)}`);
    return response.data;
  } catch (error) {
    const status = error.response ? error.response.status : 500;
    const message = error.response?.data?.message || error.message || 'Error fetching books by author';
    const err = new Error(message);
    err.status = status;
    throw err;
  }
};

public_users.get('/author/:author', async function (req, res) {
  const requestedAuthor = req.params.author.toLowerCase();
  try {
    const getByAuthor = new Promise((resolve, reject) => {
      const matchingBooks = [];
      const keys = Object.keys(books);
      keys.forEach((key) => {
        if (books[key].author.toLowerCase() === requestedAuthor) {
          matchingBooks.push({ ISBN: key, ...books[key] });
        }
      });

      if (matchingBooks.length > 0) {
        resolve(matchingBooks);
      } else {
        reject({ status: 404, message: `No books found by author: ${req.params.author}` });
      }
    });

    const matching = await getByAuthor;
    return res.status(200).send(JSON.stringify(matching, null, 4));
  } catch (error) {
    return res.status(error.status || 404).json({
      message: error.message
    });
  }
});

// =================================================================
// Task 4 & Task 13: Get book details based on title
// Using Promise callbacks & async-await with Axios
// =================================================================
const getBooksByTitleWithAxios = async (title) => {
  try {
    const response = await axios.get(`http://localhost:5000/title/${encodeURIComponent(title)}`);
    return response.data;
  } catch (error) {
    const status = error.response ? error.response.status : 500;
    const message = error.response?.data?.message || error.message || 'Error fetching books by title';
    const err = new Error(message);
    err.status = status;
    throw err;
  }
};

public_users.get('/title/:title', async function (req, res) {
  const requestedTitle = req.params.title.toLowerCase();
  try {
    const getByTitle = new Promise((resolve, reject) => {
      const matchingBooks = [];
      const keys = Object.keys(books);
      keys.forEach((key) => {
        if (books[key].title.toLowerCase() === requestedTitle) {
          matchingBooks.push({ ISBN: key, ...books[key] });
        }
      });

      if (matchingBooks.length > 0) {
        resolve(matchingBooks);
      } else {
        reject({ status: 404, message: `No books found with title: ${req.params.title}` });
      }
    });

    const matching = await getByTitle;
    return res.status(200).send(JSON.stringify(matching, null, 4));
  } catch (error) {
    return res.status(error.status || 404).json({
      message: error.message
    });
  }
});

// =================================================================
// Task 5: Get book reviews based on ISBN
// =================================================================
public_users.get('/review/:isbn', function (req, res) {
  const book = books[req.params.isbn];

  if (book) {
    return res.status(200).send(JSON.stringify(book.reviews || {}, null, 4));
  }

  return res.status(404).json({ message: `Book with ISBN ${req.params.isbn} not found` });
});

module.exports.general = public_users;
module.exports.getBookListWithAxios = getBookListWithAxios;
module.exports.getBookByISBNWithAxios = getBookByISBNWithAxios;
module.exports.getBooksByAuthorWithAxios = getBooksByAuthorWithAxios;
module.exports.getBooksByTitleWithAxios = getBooksByTitleWithAxios;
