const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const todos = [];

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index', { todos });
});

app.post('/add', (req, res) => {
    const { todo } = req.body;
    if (todo) {
        todos.push(todo);
    }
    res.redirect('/');
});

app.post('/delete', (req, res) => {
    const index = req.body.index;
    if (typeof todos[index] !== 'undefined') {
        todos.splice(index, 1);
    }
    res.redirect('/');
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
