# Weather Now

## Getting started

You need [Node.js](https://nodejs.org) 20.12 or later.

1. Install the dependencies:

   ```sh
   npm install
   ```

2. Copy `.env.example` to `.env`:

   ```sh
   cp .env.example .env
   ```

3. Create a free API key at <https://home.openweathermap.org/api_keys> and paste it into `.env`:

   ```
   OPENWEATHER_API_KEY=your_api_key_here
   ```

   A new key can take a couple of hours to start working.

4. Start the server:

   ```sh
   npm run dev
   ```

5. Open <http://localhost:3000>.

The server restarts when you save `server.js`. After changing files in `public/`, reload the page.

> **Stuck?** Run `npm run solution` to see the finished app. The code is in `solution/`.
