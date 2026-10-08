# Uber Ride Simulation

A Dockerized distributed ride-hailing platform built with Go, Python, Kafka, Redis, MySQL, MongoDB, REST APIs, and machine-learning pricing.

## Architecture

| Component | Responsibility | Technology |
|---|---|---|
| `matching-service` | Geospatial nearest-driver matching and atomic reservation | Go, Redis |
| `rides-service` | Ride lifecycle, REST APIs, cache invalidation, event publishing | Node.js, Express, MongoDB, MySQL, Kafka |
| `drivers-service` | Driver profiles and location queries | Node.js, Express, MongoDB, Redis |
| `customers-service` | Customer profiles and ride actions | Node.js, Express, MongoDB |
| `billing-service` | Kafka ride-completed consumer and billing records | Node.js, Express, Kafka, MongoDB, MySQL |
| `ml-service` | Fare estimation | Python, FastAPI, XGBoost/joblib |
| `frontend-service` | Web client | React, Vite, Nginx |

MongoDB remains the document store for customer, driver, ride, and billing documents. MySQL stores normalized transactional ride and billing records. Redis handles driver reservations and hot-query caching. Kafka decouples ride completion from billing.

## Run the complete project

Prerequisites: Docker Desktop, Go 1.22+, Node.js 18+, and optionally k6 for load testing.

```bash
docker compose config
docker compose up -d --build
docker compose ps
```

The first startup downloads images and builds the services. A fresh MongoDB volume is seeded with one development driver:

```text
driverId: 123-45-6789
customerId for test rides: 987-65-4321
```

Basic health checks:

```bash
curl http://localhost:4010/health
curl http://localhost:8000/docs
curl http://localhost:4002/api/drivers
```

The frontend is available at `http://localhost:5173`. Mapbox is optional: without `VITE_MAPBOX_TOKEN`, the booking screen accepts `latitude, longitude` values directly, which is useful for local backend verification. Copy `uber-frontend/.env.example` if you want address search and the interactive map.

### Local service URLs

| Service | URL |
|---|---|
| Web application | `http://localhost:5173` |
| Rides API | `http://localhost:4001` |
| Drivers API | `http://localhost:4002` |
| Customers API | `http://localhost:4003` |
| Billing API | `http://localhost:4004` |
| Admin API | `http://localhost:4005` |
| Matching API | `http://localhost:4010` |
| Pricing API | `http://localhost:8000/docs` |

### Complete ride flow

The fresh local database includes a development driver with ID `123-45-6789`. Create a ride using the seeded customer ID, then inspect the resulting records:

```bash
curl -X POST http://localhost:4001/api/rides \
  -H 'Content-Type: application/json' \
  -d '{
    "pickupLocation": {
      "latitude": 37.7749,
      "longitude": -122.4194,
      "address": "Market Street, San Francisco"
    },
    "dropoffLocation": {
      "latitude": 37.7849,
      "longitude": -122.4094,
      "address": "Union Square, San Francisco"
    },
    "dateTime": "2026-10-07T18:00:00.000Z",
    "customerId": "987-65-4321",
    "passenger_count": 1
  }'
```

If the ride endpoint returns `404`, verify the route exposed by the running rides service and inspect its logs with `docker compose logs rides-service`. A new MongoDB volume runs the seed script automatically; an existing volume does not rerun initialization scripts.

## Verify MySQL synchronization

The schema is in `infra/mysql/init/001_schema.sql`. For an existing MySQL volume, apply it manually if needed:

```bash
docker compose exec -T mysql mysql -uuber_app -puber_password uber_simulation \
  < infra/mysql/init/001_schema.sql
```

Inspect relational data after creating or completing a ride:

```bash
docker compose exec mysql mysql -uuber_app -puber_password uber_simulation \
  -e "SELECT ride_id, status, estimated_price, actual_price FROM rides ORDER BY created_at DESC LIMIT 5;"

docker compose exec mysql mysql -uuber_app -puber_password uber_simulation \
  -e "SELECT billing_id, ride_id, amount, payment_status FROM billing_records ORDER BY created_at DESC LIMIT 5;"
```

Detailed integration notes are in [`docs/mysql-integration.md`](docs/mysql-integration.md).

## Validate the Go matcher

```bash
cd services/matching-go
go mod tidy
go test ./...
go build .
cd ../..
```

The matcher exposes:

- `GET /health`
- `POST /api/v1/match`
- `GET /metrics`

Redis reservations use `SETNX` with a configurable TTL, so concurrent requests cannot reserve the same driver successfully.

## Configuration

Each Node.js service provides an `.env.example` file with local defaults. The matching service accepts `MATCHING_PORT`, `REDIS_ADDR`, `DRIVER_SERVICE_URL`, and `RESERVATION_TTL_SECONDS`. The frontend accepts optional `VITE_MAPBOX_TOKEN` and `VITE_GOOGLE_MAPS_API_KEY` values. Do not commit real credentials or production secrets.

## Benchmark the matching service

Start the matcher and Redis first, then run:

```bash
RUN_ID=$(date +%s) k6 run \
  --out json=matching-results-$(date +%s).json \
  -e VUS=1000 \
  -e DURATION=30s \
  benchmarks/k6/matching.js
```

### Recorded benchmark result

The following result was recorded from a local Docker deployment of the matching service:

| Measurement | Result |
|---|---:|
| Concurrent virtual users | 1,000 |
| Test duration | 30 seconds |
| Completed requests | 854,475 |
| Throughput | 28,452.91 requests/second |
| p99 HTTP latency | 110.15 ms |
| HTTP failure rate | 0.00% |
| Successful checks | 100.00% |

These results represent the matching service under the stated local test conditions.

## Useful commands

```bash
make test
make build
make up
make logs
make mysql-check
make down
```

## Project documentation

- [`docs/local-development.md`](docs/local-development.md)
- [`docs/mysql-integration.md`](docs/mysql-integration.md)
- [`services/matching-go/README.md`](services/matching-go/README.md)
- [`benchmarks/README.md`](benchmarks/README.md)
