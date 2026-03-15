const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {

    const username = req.body.username;
    const password = req.body.password;
  
    if (username && password) {
        if (!doesExist(username)) {
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(409).json({message: "User already exists!"});
        }
    }
    return res.status(400).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book){
    return res.status(200).json(books[isbn]);
  } else {
    return res.status(404).json({ message: "Book not found"});
  }

 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    const booksArray = Object.values(books);
    const filteredBooks = booksArray.filter(book => book.author.toLowerCase() === author.toLowerCase());
    
    if (filteredBooks.length > 0){
      return res.status(200).json(filteredBooks);
    } else {
      return res.status(404).json({ message: "Book not found"});
    }
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
