const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {

    const username = req.body.username;
    const password = req.body.password;
  
    if (username && password) {
        if (!isValid(username)) {
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(409).json({message: "User already exists!"});
        }
    }
    return res.status(400).json({message: "Unable to register user."});
});


// Function that returns a Promise to get books
function getBooks() {
    return new Promise((resolve, reject) => {
      // Simulate async operation, e.g., database fetch or file read
      setTimeout(() => {
        if (books) {
          resolve(books);
        } else {
          reject("No books available");
        }
      }, 1000); // 1 second delay simulating async
    });
  }
  
  // Using the Promise with .then() and .catch()
  getBooks()
    .then((bookList) => {
      console.log("Available books:", bookList);
      // You could also send this as a response in an Express route
    })
    .catch((error) => {
      console.error(error);
    });

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    getBooks()
    .then((bookList) => {
      res.status(200).json(bookList);
    })
    .catch((error) => {
      res.status(500).json({ message: error });
    });
});


// Function to get book details by ISBN using a Promise
function getBookByISBN(isbn) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const book = books[isbn];  // if books is an object keyed by ISBN
  
        if (book) {
          resolve(book);
        } else {
          reject("Book not found");
        }
      }, 1000); // simulate async delay
    });
  }
  
// Get book details based on ISBN
  public_users.get('/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;
  
    getBookByISBN(isbn)
      .then((book) => {
        res.status(200).json(book);
      })
      .catch((error) => {
        res.status(404).json({ message: error });
      });
  });

  // Function to get book details by author using a Promise
function getBookByAuthor(author) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const booksArray = Object.values(books);
        const filteredBooks = booksArray.filter(book => book.author.toLowerCase() === author.toLowerCase());
        
        if (filteredBooks.length > 0){
            resolve(filteredBooks);
        } else {
          reject("No books found by this author");
        }
      }, 1000); // simulate async delay
    });
  }

// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;

    getBookByAuthor(author)
    .then((books) => {
        res.status(200).json(books);
    })
    .catch((error) =>{
        res.status(404).json({ message: error});
    });

});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    const booksArray = Object.values(books);
    const filteredBooks = booksArray.filter(book => book.title.toLowerCase() === title.toLowerCase());
    
    if (filteredBooks.length > 0){
      return res.status(200).json(filteredBooks);
    } else {
      return res.status(404).json({ message: "Book not found"});
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book){
      return res.status(200).json(book.reviews);
    } else {
      return res.status(404).json({ message: "Book not found"});
    }
});

module.exports.general = public_users;
