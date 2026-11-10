//  Run with:  npm run solution
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

// GET /api/weather?city=Stockholm
// GET /api/weather?lat=59.33&lon=18.07
app.get("/api/weather", async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({ message: "Server is missing OPENWEATHER_API_KEY" });
  }

  const { city, lat, lon } = req.query;

  const params = new URLSearchParams({ appid: API_KEY, units: "metric" });

  if (lat && lon) {
    params.set("lat", lat);
    params.set("lon", lon);
  } else if (city) {
    params.set("q", city);
  } else {
    return res.status(400).json({ message: "Give a city or lat and lon" });
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?${params}`;
    const response = await fetch(url);
    const data = await response.json();

    res.status(response.status).json(data);
  } catch (error) {
    console.error(error);
    res.status(502).json({ message: "Could not reach OpenWeather" });
  }
});

app.listen(PORT, () => {
  console.log(`Solution running at http://localhost:${PORT}`);
});
