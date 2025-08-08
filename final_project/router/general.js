const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (isValid(username)) {
    return res.status(400).json({ message: "Username already exists" });
  }
  let user = { username, password };
  users.push(user);
  console.log(users); 
  return res.status(200).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  return res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn=req.params.isbn;
  const book= books[isbn];
  if(book) {
    return res.send(book);
  }
  else {
    return res.status(404).json({message: "Book not found"});
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author= req.params.author;
  let foundbooks =[];
  for (let key in books){
    if(books[key].author.toLowerCase() === author.toLowerCase()) {
      foundbooks.push(books[key]);
    }
  }
  if(foundbooks.length > 0) {
    return res.send(foundbooks);
  }else {
    return res.status(404).json({message: "No books found for this author"});
  }
  
 
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title= req.params.title;
  let foundbooks = [];
  for (let key in books){
    if(books[key].title.toLowerCase() === title.toLowerCase()) {
      foundbooks.push(books[key]);
    }
  }
  if(foundbooks.length > 0) {
    return res.send(foundbooks);
  } else {
    return res.status(404).json({message: "No books found with this title"});
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn];
  if(book && book.reviews) {
    return res.send(book.reviews);
  } else {
    return res.status(404).json({message: "No reviews found for this book"});
  }
});
public_users.get('/async/books', function (req, res) {
    
    function getAllBooks(callback) {
        setTimeout(() => {
            callback(null, books);
        }, 1000);
    }
    
    getAllBooks((error, books) => {
        if (error) {
            res.status(500).json({message: "Error retrieving books"});
        } else {
            res.send(JSON.stringify(books, null, 4));
        }
    });
});
// Task 11: Get book details based on ISBN using Promises
public_users.get('/promise/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    
    
    let getBookByISBN = new Promise((resolve, reject) => {
        setTimeout(() => {
            const book = books[isbn];
            if (book) {
                resolve(book);
            } else {
                reject("Book not found");
            }
        }, 1000);
    });
    
    getBookByISBN.then(book => {
        res.send(book);
    }).catch(error => {
        res.status(404).json({message: error});
    });
});
// Task 12: Get book details based on Author using async/await
public_users.get('/async/author/:author', async function (req, res) {
    const author = req.params.author;
    
    
    async function getBooksByAuthor(authorName) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let booksByAuthor = [];
                for (let key in books) {
                    if (books[key].author === authorName) {
                        booksByAuthor.push(books[key]);
                    }
                }
                resolve(booksByAuthor);
            }, 1000);
        });
    }
    
    try {
        const booksByAuthor = await getBooksByAuthor(author);
        if (booksByAuthor.length > 0) {
            res.send(booksByAuthor);
        } else {
            res.status(404).json({message: "No books found by this author"});
        }
    } catch (error) {
        res.status(500).json({message: "Error retrieving books"});
    }
});

// Task 13: Get book details based on Title using async/await
public_users.get('/async/title/:title', async function (req, res) {
    const title = req.params.title;
    
    
    async function getBooksByTitle(bookTitle) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let booksByTitle = [];
                for (let key in books) {
                    if (books[key].title === bookTitle) {
                        booksByTitle.push(books[key]);
                    }
                }
                resolve(booksByTitle);
            }, 1000);
        });
    }
    
    try {
        const booksByTitle = await getBooksByTitle(title);
        if (booksByTitle.length > 0) {
            res.send(booksByTitle);
        } else {
            res.status(404).json({message: "No books found with this title"});
        }
    } catch (error) {
        res.status(500).json({message: "Error retrieving books"});
    }
});


module.exports.general = public_users;
