const http = require('http');
const mongoose = require('mongoose');

const app = require('./app');

const { loadPlanetsData } = require('./models/planets.model')

const PORT = process.env.PORT || 8000; // Checks if there was an environment variable for PORT, else just use port 8000

const MONGO_URL = 'connection string here'

const server = http.createServer(app); // We pass the express app to the server as a listener / handler

mongoose.connection.once('open', () => { // Event emitter (.once will only be triggered once when the code is executed)
    console.log('Connected to database!')
})

mongoose.connection.on('error', (err) => { // We can add these event handlers anywhere in the file, as long as we required / imported the mongoose module
    console.error(err)
})

async function startServer() {
    await mongoose.connect(MONGO_URL); // Connect to MongoDB
    await loadPlanetsData(); // Wait for planets data to populate before the server starts listening to requests

    server.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`)
    })
}

startServer();