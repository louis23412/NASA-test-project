const { parse } = require('csv-parse');
const fs = require('fs');
const path = require('path');

const planets = require('./planets.mongo');

function isHabitablePlanet(planet) {
    return planet['koi_disposition'] === 'CONFIRMED' 
        && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
        && planet['koi_prad'] < 1.6
}

function loadPlanetsData() {
    return new Promise((resolve, reject) => {
        fs.createReadStream(path.join(__dirname , '..' , '..', 'data', 'kepler_data.csv'))
        .pipe(parse({
            comment : '#',
            columns : true
        }))
    
        .on('data', async (data) => {
            if (isHabitablePlanet(data)) {
                savePlanet(data)
            }
        })
    
        .on('error', (err) => {
            console.log(err.message)
            reject(err);
        })
    
        .on('end', async () => {
            const countPlanetsFound = (await getAllPlanets()).length
            console.log(`${countPlanetsFound} habitable planets found!`)
            resolve();
        })
    })
}

async function getAllPlanets() {
    return await planets.find({})
}

async function savePlanet(planet) {
    try {
        // insert + update = upsert

        // Save planet to mongoDB database (Only add planet if it does not exist)
        await planets.updateOne({
            keplerName : planet.kepler_name // Find planets with the current kepler_name
        }, {
            keplerName : planet.kepler_name // If it doesnt exist we insert this. If it does exist we just update the document with this 
        }, {
            upsert : true // We need to set this to true or the update function will only update
        })
    } catch (err) {
        console.err(`Could not save planet ${err}`)
    }
}

module.exports = {
    loadPlanetsData,
    getAllPlanets
}