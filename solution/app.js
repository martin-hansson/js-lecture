const UPPSALA = { lat: 59.8586, lon: 17.6387 };

const form = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const locateButton = document.getElementById("locate-btn");
const statusText = document.getElementById("status");

const cityEl = document.getElementById("city");
const countryEl = document.getElementById("country");
const updatedEl = document.getElementById("updated");
const iconEl = document.getElementById("icon");
const tempEl = document.getElementById("temp");
const descriptionEl = document.getElementById("description");
const tempMaxEl = document.getElementById("temp-max");
const tempMinEl = document.getElementById("temp-min");
const feelsLikeEl = document.getElementById("feels-like");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const pressureEl = document.getElementById("pressure");
const cloudsEl = document.getElementById("clouds");
const visibilityEl = document.getElementById("visibility");
const sunriseEl = document.getElementById("sunrise");
const sunsetEl = document.getElementById("sunset");

function setStatus(message, isError = false) {
  statusText.textContent = message;
  statusText.classList.toggle("error", isError);
}

// Shifts a Unix timestamp by the location's UTC offset (seconds) and formats
// it as UTC, which yields the local clock time at that location.
function formatTime(unixSeconds, timezoneOffset) {
  const date = new Date((unixSeconds + timezoneOffset) * 1000);
  return date.toLocaleTimeString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

async function getWeather(coords) {
  // Without URLSearchParams:
  //   "lat=" + coords.lat + "&lon=" + coords.lon
  const params = new URLSearchParams(coords);

  const response = await fetch(`/api/weather?${params}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

async function findCity(city) {
  const params = new URLSearchParams({ city }); // { city: city }

  const response = await fetch(`/api/geocode?${params}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

function showWeather(data) {
  console.log(data);

  cityEl.textContent = data.name || "Unnamed place";
  countryEl.textContent = data.sys.country;

  tempEl.textContent = Math.round(data.main.temp);
  tempMaxEl.textContent = Math.round(data.main.temp_max);
  tempMinEl.textContent = Math.round(data.main.temp_min);
  feelsLikeEl.textContent = Math.round(data.main.feels_like);
  humidityEl.textContent = data.main.humidity;
  pressureEl.textContent = data.main.pressure;
  windEl.textContent = data.wind.speed.toFixed(1);
  cloudsEl.textContent = data.clouds.all;

  visibilityEl.textContent = (data.visibility / 1000).toFixed(1);

  const condition = data.weather[0];
  descriptionEl.textContent = condition.description;

  iconEl.src = `https://openweathermap.org/img/wn/${condition.icon}@4x.png`;
  iconEl.alt = condition.description;

  sunriseEl.textContent = formatTime(data.sys.sunrise, data.timezone);
  sunsetEl.textContent = formatTime(data.sys.sunset, data.timezone);
  updatedEl.textContent = `Updated ${formatTime(data.dt, data.timezone)}`;

  document.title = `${Math.round(data.main.temp)}° ${data.name} – Weather Now`;
}

async function loadWeather(coords) {
  setStatus("Loading…");
  try {
    const data = await getWeather(coords);
    showWeather(data);
    setStatus("");
  } catch (error) {
    setStatus(`Error: ${error.message}`, true);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();
  if (city === "") {
    setStatus("Type a city name first", true);
    return;
  }
  cityInput.value = "";

  setStatus(`Looking up ${city}…`);
  try {
    const place = await findCity(city);

    // Without destructuring:
    //   const lat = place.lat;
    //   const lon = place.lon;
    const { lat, lon } = place;
    await loadWeather({ lat, lon });
  } catch (error) {
    setStatus(`Error: ${error.message}`, true);
  }
});

function getPosition() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

locateButton.addEventListener("click", async () => {
  if (!("geolocation" in navigator)) {
    setStatus("Your browser does not support geolocation", true);
    return;
  }

  setStatus("Finding your location…");
  locateButton.classList.add("loading");

  try {
    const position = await getPosition();

    // Without destructuring:
    //   const latitude = position.coords.latitude;
    //   const longitude = position.coords.longitude;
    const { latitude, longitude, accuracy } = position.coords;
    console.log(`Position ±${Math.round(accuracy)} m`);

    await loadWeather({ lat: latitude, lon: longitude });
  } catch (error) {
    setStatus(`Could not get your location: ${error.message}`, true);
  } finally {
    locateButton.classList.remove("loading");
  }
});

loadWeather(UPPSALA);
