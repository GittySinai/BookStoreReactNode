const express = require('express')
const cors = require('cors');
const fs = require('fs')
const app = express()
const port = 3001
app.use(cors());
app.use(express.json()); 

function readBooksData(callback) {
    fs.readFile('./data.json', 'utf8', (err, data) => {
        if (err) {
            return callback(err, null)
        }
        try {
            const books = JSON.parse(data)
            callback(null, books)
        } catch (parseError) {
            callback(parseError, null)
        }
    })
}

function writeBooksData(books, callback) {
    fs.writeFile('./data.json', JSON.stringify(books, null, 2), 'utf8', (err) => {
        if (err) {
            return callback(err);
        }
        callback(null);
    });
}

app.get('/books', (req, res) => {
    readBooksData((err, books) => {
        if (err) {
            console.error(err)
            return res.status(500).send('Error reading data')
        }
        res.json(books)
    })
})

app.put('/books/:id', (req, res) => {
    const bookId = req.params.id;
    const updatedBook = req.body;

    readBooksData((err, books) => {
        if (err) {
            console.error('Error reading data:', err); 
            return res.status(500).send('Error reading data');
        }

        const bookIndex = books.books.findIndex(book => book.id === bookId);
        if (bookIndex === -1) {
            return res.status(404).send('Book not found');
        }

        books.books[bookIndex] = { ...books.books[bookIndex], ...updatedBook };

        writeBooksData(books, (writeErr) => {
            if (writeErr) {
                console.error('Error writing data:', writeErr); 
                return res.status(500).send('Error updating data');
            }
            res.json(books.books[bookIndex]); 
        });
    });
});


app.delete('/books/:id', (req, res) => {
    const bookId = req.params.id;

    readBooksData((err, books) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading data');
        }
        const updatedBooks = books.books.filter(book => book.id !== bookId);

        if (updatedBooks.length === books.books.length) {
            return res.status(404).send('Book not found');
        }

        writeBooksData({ books: updatedBooks }, (writeErr) => {
            if (writeErr) {
                console.error(writeErr);
                return res.status(500).send('Error writing data');
            }
            res.status(200).send('Book deleted successfully');
        });
    });
});

app.post('/books', (req, res) => {
    const newBook = req.body;

    readBooksData((err, books) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading data');
        }
        newBook.id = String(Math.max(...books.books.map(book => Number(book.id))) + 1);
        books.books.push(newBook);

        writeBooksData(books, (writeErr) => {
            if (writeErr) {
                console.error(writeErr);
                return res.status(500).send('Error writing data');
            }
            res.status(201).json(newBook);
        });
    });
});


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
