//import express & NeDB
const express = require('express');
const DataStore = require('nedb');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)); //loading fetch asynchronously

const app = express();

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const port = process.env.PORT || 5500;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})

app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));

const database = new DataStore('data.db');
database.loadDatabase();

app.get('/api', (request, response) => {
    database.find({}, (err, data) => {
        if (err) {
            response.end();
            return;
        }
        response.json(data);
    })
})

// endpoint for route
app.post('/api', (request, response) => {
    console.log('Request received');

    const data = request.body;
    const timestamp = Date.now();
    data.timestamp = timestamp;
    database.insert(data);

    response.json({
        status: 'success',
        timestamp: timestamp,
        latitude: data.lat,
        lonigtude: data.lon,
        air_quality: data.air,
        weather: data.weather_data
    });
})

//get coordinates from mapbox API
app.get('/coordinates/:location', async (request, response) => {
    console.log(request.params.location);
    const location = request.params.location = request.params.location;
    const access_token = process.env.MAPBOX_TOKEN;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${location}.json?access_token=${access_token}`;
    const loc_response = await fetch(url);
    const loc_data = await loc_response.json();

    response.json(loc_data);
});

// get weather data
app.get('/weather/:latlon', async (request, response) => {
    console.log(request.params.latlon);
    const latlon = request.params.latlon;
    const lat = latlon.split(',')[0];
    const lon = latlon.split(',')[1];
    const api_key = process.env.WEATHER_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${api_key}`;
    const weather_response = await fetch(url);
    const weather_data = await weather_response.json();

    response.json(weather_data);
})

// get air quality data
app.get('/air/:latlon', async (request, response) => {
    console.log(request.params.latlon);
    const latlon = request.params.latlon;
    const lat = latlon.split(',')[0];
    const lon = latlon.split(',')[1];
    const url = `https://api.openaq.org/v2/latest?coordinates=${lat},${lon}`;
    const AQ_response = await fetch(url);
    const AQ_Data = await AQ_response.json();

    response.json(AQ_Data);
})