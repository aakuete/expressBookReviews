const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    let userswithsamename = users.filter((user) => {
        return user.username === username});
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {

    const { username, password } = req.body;

    // Check if username exists
    if (!isValid(username)) {
      return res.status(401).json({ message: "Invalid username" });
    }
  
    // Check if username and password match
    if (!authenticatedUser(username, password)) {
      return res.status(401).json({ message: "Invalid password" });
    }
  
    // If valid, create JWT token
    const payload = { username };
    const jwtToken = jwt.sign(payload, "access", { expiresIn: '1h' });
  
    // Send token in response
    res.json({ message: "User logged in successfully", token: jwtToken });

});

// Middleware to set req.user from session
regd_users.use((req, res, next) => {
    if (req.session && req.session.authorization) {
      req.user = req.session.authorization.username;
    }
    next();
  });

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    
    const isbn = req.params.isbn;
    const review = req.body.review;
    const username = req.user?.username;
  
    if (!username) {
        return res.status(401).json({ message: "User not authenticated" });
      }
    
    if (!review) {
      return res.status(400).json({ message: "Review content is required" });
    }
  
    const book = books[isbn]; 
  
    if (book) {
      if (!book.reviews) {
        book.reviews = {};
      }
      book.reviews[username] = review; // add/update review by user
      console.log("Reviews:", book.reviews);

      return res.status(200).json({ message: "Review updated", reviews: book.reviews });
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
});


regd_users.delete("/auth/review/:isbn", (req, res) => {

    const username = req.user?.username;
    const isbn = req.params.isbn;
  
    if (!username) {
      return res.status(401).json({ message: "User not authenticated" });
    }
  
   
    const book = books[isbn];
  
    if (book) {
      if (book.reviews && book.reviews[username]) {
        delete book.reviews[username];
        return res.status(200).json({ message: `User ${username}'s review for book ${isbn} deleted.` });
      } else {
        return res.status(404).json({ message: "Review not found for this user." });
      }
    } else {
      return res.status(404).json({ message: "Book not found." });
    }

});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
