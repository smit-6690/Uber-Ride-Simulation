# Go real-time matching service

This service owns nearest-driver selection for the ride lifecycle.

## Responsibilities

- Select the nearest available driver using Haversine distance.
- Fetch drivers from `DRIVER_SERVICE_URL/api/drivers` when the request does not provide an inline list.
- Reserve the selected driver atomically in Redis with `SETNX` and a configurable TTL.
- Expose health, matching, and Prometheus-compatible metrics endpoints.

## Endpoints

`GET /health`

`POST /api/v1/match`

`GET /metrics`

Example request:

```json
{
  "pickup": {"latitude": 37.7749, "longitude": -122.4194},
  "drivers": [
    {
      "driverId": "driver-local-1",
      "location": {"latitude": 37.7750, "longitude": -122.4195},
      "available": true
    }
  ]
}
```

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `MATCHING_PORT` | `4010` | HTTP listener port |
| `REDIS_ADDR` | `redis:6379` | Redis address |
| `DRIVER_SERVICE_URL` | `http://drivers-service:4002` | Driver API base URL |
| `RESERVATION_TTL_SECONDS` | `120` | Reservation lock duration |

The Redis connection is created once at startup and reused across requests. This avoids a connection and health-check round trip for every match.
