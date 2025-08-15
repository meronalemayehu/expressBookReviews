const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Check if user already exists
  const userExists = users.some((user) => user.username === username);

  if (userExists) {
    return res.status(409).json({ message: "User already exists!" });
  }

  // Add new user
  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    return res.status(200).send(JSON.stringify(books));
  });

public_users.get('/async-get-books', async function (req, res) {
  //Write your code here
  try {
    let getBooks = () => {
      return new Promise((resolve, reject) => {
        resolve(books);
      });
    };

    const bookList = await getBooks();
    return res.status(200).send(JSON.stringify(bookList, null, 4));
  } catch (err) {
    return res.status(500).json({ message: "Error retrieving books" });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Book not found." });
  }
 });
  
public_users.get('/async-isbn/:isbn', async function (req, res) {
try {
    const isbn = req.params.isbn;

    let getBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
        resolve(book);
        } else {
        reject("Book not found");
        }
    });
    };

    const bookData = await getBookByISBN(isbn);
    return res.status(200).send(bookData);

} catch (err) {
    return res.status(404).json({ message: err });
}
});


// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  const author = req.params.author;
  const filteredBooks = [];

  for (let isbn in books) {
    if (books[isbn].author === author) {
      filteredBooks.push({ isbn, ...books[isbn] });
    }
  }

  if (filteredBooks.length > 0) {
    return res.status(200).json(filteredBooks);
  } else {
    return res.status(404).json({ message: "No books found by that author" });
  }
});

public_users.get('/async-author/:author', async function (req, res) {
    try {
      const author = req.params.author;
  
      let getBooksByAuthor = (author) => {
        return new Promise((resolve, reject) => {
          const matchingBooks = Object.values(books).filter(
            (book) => book.author === author
          );
  
          if (matchingBooks.length > 0) {
            resolve(matchingBooks);
          } else {
            reject("No books found for this author");
          }
        });
      };
  
      const result = await getBooksByAuthor(author);
      return res.status(200).json(result);
  
    } catch (err) {
      return res.status(404).json({ message: err });
    }
  });
  

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title;
  const filteredBooks = [];

  for (let isbn in books) {
    if (books[isbn].title === title) {
      filteredBooks.push({ isbn, ...books[isbn] });
    }
  }

  if (filteredBooks.length > 0) {
    return res.status(200).json(filteredBooks);
  } else {
    return res.status(404).json({ message: "No books found with that title" });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book && book.reviews) {
    res.status(200).json(book.reviews);
  } else {
    res.status(404).json({ message: "Book not found or no reviews available." });
  }
});

module.exports.general = public_users;
