const http = require('http');

const app = require('./app');

const { loadPlanetsData } = require('./models/planets.model')

const PORT = process.env.PORT || 8000; // Checks if there was an environment variable for PORT, else just use port 8000

const server = http.createServer(app); // We pass the express app to the server as a listener / handler

async function startServer() {
    await loadPlanetsData(); // Wait for planets data to populate before the server starts listening to requests

    server.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`)
    })
}

startServer();