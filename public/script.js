// Get coordinates based on address input and rendering to webpage
if ('geolocation' in navigator) {
    console.log('geolocation available');
    navigator.geolocation.getCurrentPosition(async () => {
        const button = document.getElementById('location');
        button.addEventListener('click', async () => {
            const location = document.getElementById('loc').value;

            const url = `coordinates/${location}`;

            const loc_response = await fetch(url);

            const loc_data = await loc_response.json();

            const coords = loc_data.features[0].geometry.coordinates

            const lon = coords[0];
            const lat = coords[1];


            document.getElementById('latitude').textContent = lat;
            document.getElementById('longitude').textContent = lon;


            // configuring map

            const map = L.map("isMap").setView([51.505, -0.09], 1);

            const marker = L.marker([0, 0]).addTo(map);

            const attribution =
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

            const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

            const tiles = L.tileLayer(tileUrl, { attribution });

            tiles.addTo(map);

            marker.setLatLng([lat, lon]);
            map.setView([lat, lon], 2);

            // fetching data from open weather map API and OpenAQ API
            const weather_url = `weather/${lat},${lon}`;
            const weather_response = await fetch(weather_url);
            const weather_data = await weather_response.json();

            const AQ_url = `air/${lat},${lon}`;
            const AQ_response = await fetch(AQ_url);
            const AQ_Data = await AQ_response.json();

            const air = AQ_Data.results[0].measurements[0];


            const api_data = {
                weather: weather_data,
                air_quality: AQ_Data
            }
            console.log(api_data);

            try {
                document.getElementById('summary').textContent = weather_data.weather[0].description;
                document.getElementById('temperature').textContent = weather_data.main.temp.toFixed(2);
                document.getElementById('aq_parameter').textContent = air.parameter;
                document.getElementById('aq_value').textContent = air.value;
                document.getElementById('aq_unit').textContent = air.unit;
                document.getElementById('aq_date').textContent = air.lastUpdated;

            } catch (error) {
                console.log(error);
                air = { value: -1 }
                document.getElementById('aq_value').textContent = 'NO READING';
            }

            // fetching data from node server and mapping to database
            const data = { lat, lon, air, weather_data };
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            };

            const db_response = await fetch('/api', options);
            const db_json = await db_response.json();
            console.log(db_json);

        });
    });

} else {
    alert('Geolocation is not available');
}


