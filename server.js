import express from "express";

try {
  process.loadEnvFile();
} catch {
  console.warn("No .env file found - copy .env.example to .env");
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

// TODO (live coding): add an /api/weather route here that calls
// OpenWeather with process.env.OPENWEATHER_API_KEY and returns the JSON.
// Support both ?city=Stockholm and ?lat=59.33&lon=18.07 (from geolocation).
// Keeping the key on the server means it never reaches the browser.

app.listen(PORT, () => {
  console.log(`Weather app running at http://localhost:${PORT}`);
});
