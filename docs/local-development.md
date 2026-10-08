# Local development

The complete stack runs through Docker Compose. Do not commit real credentials; the Compose file uses development-only local database credentials.

## Prerequisites

- Docker Desktop
- Go 1.22 or newer
- Node.js 18 or newer
- k6 for the optional load test

Verify the local tools:

```bash
go version
docker version
docker compose version
```

## Start the complete stack

From the repository root:

```bash
docker compose config
docker compose up -d --build
docker compose ps
```

This starts MongoDB, MySQL, Redis, Kafka, the Go matcher, the Python pricing service, the Node.js services, and the frontend. MongoDB seeds a development driver on a fresh volume.

## Start only the matching slice

```bash
docker compose up -d redis matching-service
curl http://localhost:4010/health
```

Test a match:

```bash
curl -X POST http://localhost:4010/api/v1/match \
  -H 'Content-Type: application/json' \
  -d '{
    "pickup": {"latitude": 37.7749, "longitude": -122.4194},
    "drivers": [{
      "driverId": "driver-local-1",
      "location": {"latitude": 37.7750, "longitude": -122.4195},
      "available": true
    }]
  }'
```

## Validate source code

```bash
cd services/matching-go
go mod tidy
go test ./...
go build .
cd ../..

for service in rides billing drivers customers admin; do
  node --check services/$service/app.js
done
```

## MySQL verification

```bash
docker compose exec mysql mysql -uuber_app -puber_password uber_simulation -e "SHOW TABLES;"
```

If the MySQL volume predates the schema, apply it without deleting the volume:

```bash
docker compose exec -T mysql mysql -uuber_app -puber_password uber_simulation < infra/mysql/init/001_schema.sql
```

## Stop the stack

```bash
docker compose down
```
