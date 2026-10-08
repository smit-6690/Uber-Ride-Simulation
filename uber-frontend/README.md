# Uber Ride Simulation frontend

React/Vite frontend for the distributed ride simulation. It connects to the exposed REST services on ports `4001`–`4005` and is served by Nginx on port `5173` in Docker.

## Local development

```bash
npm ci
npm run lint
npm run build
npm run dev
```

Create `.env` from `.env.example` to enable Mapbox address search and the route map. Without a Mapbox token, the booking screen accepts coordinates in `latitude, longitude` format and still exercises the real backend matching and pricing flow.
