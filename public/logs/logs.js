// configuring map

const mymap = L.map('checkinMap').setView([0, 0], 2);
const attribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
//const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const tileUrl =
  'https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png';
const tiles = L.tileLayer(tileUrl, { attribution });
tiles.addTo(mymap);


// querying data from the database

async function getData() {
  const response = await fetch('/api');
  const data = await response.json();
  console.log(data);

  // looping to check if air quality reading is within the data
  for (item of data) {
    const marker = L.marker([item.lat, item.lon]).addTo(mymap);
    let text = `The weather here is ${item.weather_data.weather[0].description} with a temperature of ${item.weather_data.main.temp}&deg; degrees celcius.`

    if (item.air.value < 0) {
      text += ' No air quality reading.';
    } else {
      text += ` The concentration of
        particulate matter (${item.air.parameter}) is
       ${item.air.value} ${item.air.unit} last read on
        ${item.air.lastUpdated}`
    }

    // binding text to markers
    marker.bindPopup(text);
  }
}
getData();
