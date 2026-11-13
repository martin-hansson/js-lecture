import express from "express";

try {
  process.loadEnvFile();
} catch {
  console.warn("No .env file found - copy .env.example to .env");
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

// TODO: Add /api/weather?lat=…&lon=… and /api/geocode?city=… routes that
// proxy OpenWeather, so the API key stays on the server.

app.listen(PORT, () => {
  console.log(`Weather app running at http://localhost:${PORT}`);
});
