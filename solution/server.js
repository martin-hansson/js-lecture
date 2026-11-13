import express from "express";

try {
  process.loadEnvFile();
} catch {
  console.warn("No .env file found – copy .env.example to .env");
}

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENWEATHER_API_KEY;

// Serve the solution's app.js instead of the empty starter file.
app.get("/app.js", (req, res) => {
  res.sendFile("app.js", { root: import.meta.dirname });
});

app.use(express.static("public"));

async function callOpenWeather(path, params) {
  params.set("appid", API_KEY);

  // Without URLSearchParams:
  //   const url = "https://api.openweathermap.org" + path + "?lat=" + lat + "&lon=" + lon + "&appid=" + API_KEY;
  const url = `https://api.openweathermap.org${path}?${params}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message);
    error.status = response.status;
    throw error;
  }

  return data;
}

// GET /api/geocode?city=Uppsala
app.get("/api/geocode", async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({ message: "Server is missing OPENWEATHER_API_KEY" });
  }

  const { city } = req.query; // const city = req.query.city;

  if (!city) {
    return res.status(400).json({ message: "Type a city name first" });
  }

  try {
    const places = await callOpenWeather(
      "/geo/1.0/direct",
      new URLSearchParams({ q: city, limit: 1 })
    );

    // The Geocoding API answers an unknown city with 200 and an empty list.
    if (places.length === 0) {
      return res.status(404).json({ message: `Could not find "${city}"` });
    }

    res.json(places[0]);
  } catch (error) {
    console.error(error);
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(502).json({ message: "Could not reach OpenWeather" });
    }
  }
});

// GET /api/weather?lat=59.8586&lon=17.6387
app.get("/api/weather", async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({ message: "Server is missing OPENWEATHER_API_KEY" });
  }

  // Without destructuring:
  //   const lat = req.query.lat;
  //   const lon = req.query.lon;
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ message: "Give both lat and lon" });
  }

  try {
    // { lat, lon, units: "metric" } is shorthand for { lat: lat, lon: lon, units: "metric" }
    const weather = await callOpenWeather(
      "/data/2.5/weather",
      new URLSearchParams({ lat, lon, units: "metric" })
    );

    // The weather API's station names are often unhelpful, so prefer the
    // reverse-geocoded place name when there is one.
    const places = await callOpenWeather(
      "/geo/1.0/reverse",
      new URLSearchParams({ lat, lon, limit: 1 })
    );
    if (places.length > 0) {
      weather.name = places[0].name;
    }

    res.json(weather);
  } catch (error) {
    console.error(error);
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(502).json({ message: "Could not reach OpenWeather" });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Solution running at http://localhost:${PORT}`);
});
