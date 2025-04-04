const axios = require('axios');

const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 100;

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query'

async function populateLaunches() {
    console.log('Downloading launch data...')

    const response = await axios.post(SPACEX_API_URL, {
        query : {},
        options : {
            pagination : false,

            populate : [
                {
                    path : 'rocket',
                    select : {
                        name : 1
                    }
                },

                {
                    path : 'payloads',
                    select : {
                        customers : 1
                    }
                }
            ]
        }
    });

    if (response.status !== 200) {
        console.log('Problem downloading launch data')
        throw new Error('Launch data download failed')
    }

    const launchDocs = response.data.docs

    for (const launchDoc of launchDocs) {
        const payloads = launchDoc['payloads']
        const customers = payloads.flatMap((payload) => {
            return payload['customers']
        })

        const launch = {
            flightNumber : launchDoc['flight_number'],
            mission : launchDoc['name'],
            rocket : launchDoc['rocket']['name'],
            launchDate : launchDoc['date_local'],
            upcoming : launchDoc['upcoming'],
            success : launchDoc['success'],
            customers
        }

        await saveLaunch(launch);
    }
}

async function loadLaunchData() {
    const firstLaunch = await findLaunch({
        flightNumber : 1,
        rocket : 'Falcon 1',
        mission : 'FalconSat'
    })

    if (firstLaunch) {
        console.log('Launch data already loaded')
    } else {
        await populateLaunches();
    }
}

async function findLaunch(filter) {
    return await launchesDatabase.findOne(filter)
}

async function existsLaunchWithId(launchId) {
    return await findLaunch({
        flightNumber : launchId
    })
}

async function getLatestFlightNumber() {
    const latestLaunch = await launchesDatabase
        .findOne() // Returns the first document if there is more than one that matches the criteria
        .sort('-flightNumber') // Adding - will sort in descending order (highest to lowest)

    if (!latestLaunch) {
        return DEFAULT_FLIGHT_NUMBER
    }

    return latestLaunch.flightNumber
}

async function getAllLaunches() {
    return await launchesDatabase.find({}, {
        _id : 0,
        __v : 0
    })
}

async function saveLaunch(launch) {
    await launchesDatabase.findOneAndUpdate({
        flightNumber : launch.flightNumber // We find if the data already exists in the database by flightNumber
    },
    launch, /* We insert the launch object */ {
        upsert : true // We have to set upsert to true, or the function will only update
    })
}

async function scheduleNewLaunch(launch) {
    const planet = await planets.findOne({
        keplerName : launch.target
    })

    if (!planet) {
        throw new Error('No matching planet found')
    }

    const newFlightNumber = await getLatestFlightNumber() + 1

    const newLaunch = Object.assign(launch, {
        success : true,
        upcoming : true,
        customers : ['ZTM', 'NASA'],
        flightNumber : newFlightNumber
    })

    await saveLaunch(newLaunch)
}

async function abortLaunchById(launchId) {
    const aborted = await launchesDatabase.updateOne({
        flightNumber : launchId
    }, {
        upcoming : false,
        success : false
    })

    return aborted.modifiedCount === 1;
}

module.exports = {
    loadLaunchData,
    existsLaunchWithId,
    getAllLaunches,
    scheduleNewLaunch,
    abortLaunchById
}