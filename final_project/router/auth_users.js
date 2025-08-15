const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
    {
        "username": "myNewUser",
        "password": "securePassword123"
      }
];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
  // Check if the username already exists
  let valid = true;
  users.forEach((user) => {
    if (user.username === username) {
      valid = false;
    }
  });
  return valid;
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  // Check if username and password match any record
  const doesExist = users.find((user) => {
    return user.username === username && user.password === password;
  });

  return doesExist !== undefined;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Create JWT token
  let accessToken = jwt.sign({ username: username }, 'access', { expiresIn: '1h' });

  // Save token in session
  req.session.authorization = { accessToken };

  return res.status(200).json({ message: "User successfully logged in" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.user?.username; // username from JWT payload

  if (!review) {
    return res.status(400).json({ message: "Review query is required." });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: "Review successfully added/updated." });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    //Write your code here
    const isbn = req.params.isbn;
    const username = req.user.username;
  
    if (books[isbn]) {
      let reviews = books[isbn].reviews;
  
      if (reviews[username]) {
        delete reviews[username];
        return res.status(200).json({ message: "Review deleted successfully." });
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
