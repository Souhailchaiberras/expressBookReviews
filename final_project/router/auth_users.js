const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  let userwithusername = users.filter(user => user.username === username);
  if (userwithusername.length > 0) {
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username,password)=>{ 
  let userwithusername = users.filter(user => user.username === username && user.password === password);
  if (userwithusername.length > 0) {
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
 const {username,password} = req.body;
 if (username && password) {
   if (authenticatedUser(username,password)) {
     let accessToken = jwt.sign({data: username}, 'accessToken', { expiresIn: '1h' });
     req.session.authorization = { accessToken, username };
      return res.status(200).json({message: "User successfully logged in", accessToken});
    }
    else {
      return res.status(208).json({message: "Invalid login. Check username and password"});
    }
  }
  else {
    return res.status(404).json({message: "Username and password are required"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    
    // Check if user is authenticated
    if (!req.session.authorization) {
        return res.status(403).json({ message: "User not logged in" });
    }
    
    const username = req.session.authorization.username;
    const review = req.query.review || req.body.review;
    
   
    
    if (!isbn || !review) {
        return res.status(400).json({ message: "ISBN and review are required" });
    }
    
    
    if (books[isbn]) {
        
        books[isbn].reviews[username] = review;
        
        return res.status(200).json({
            message: "Review successfully added/updated",
            book: books[isbn].title,
            user: username,
            review: review
        });
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});
// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;

    // Find the book by ISBN
    if (books[isbn]) {
        // Check if user has a review for this book
        if (books[isbn].reviews[username]) {
            delete books[isbn].reviews[username];
            return res.status(200).json({message: "Review successfully deleted"});
        } else {
            return res.status(404).json({message: "Review not found for this user"});
        }
    } else {
        return res.status(404).json({message: "Book not found"});
    }
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
