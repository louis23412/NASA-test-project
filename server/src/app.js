const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');

const planetsRouter = require('./routes/planets/planets.router')

const app = express();

// Middleware(s);
app.use(cors({
    origin : 'http://localhost:3000' // This will only add this one origin to the whitelist
}));

app.use(morgan('combined'));
app.use(express.json());

// Serving client app (public folder after running build command)
app.use(express.static(path.join(__dirname, '..', 'public')))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'))
})

// Routes
app.use(planetsRouter);

module.exports = app;