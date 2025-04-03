const mongoose = require('mongoose');

const MONGO_URL = 'connection string here'

mongoose.connection.once('open', () => { // Event emitter (.once will only be triggered once when the code is executed)
    console.log('Connected to database!')
})

mongoose.connection.on('error', (err) => { // We can add these event handlers anywhere in the file, as long as we required / imported the mongoose module
    console.error(err)
})

async function mongoConnect() {
    await mongoose.connect(MONGO_URL); // Connect to MongoDB
}

async function mongoDisconnect() {
    await mongoose.disconnect()
}

module.exports = {
    mongoConnect,
    mongoDisconnect
}