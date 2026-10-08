# Final validation checklist

## Static validation completed

- Compose YAML parses successfully.
- All JavaScript service entrypoints and modified JavaScript modules pass `node --check`.
- Package manifests and lockfiles include `mysql2` for rides and billing.
- `git diff --check` reports no whitespace errors.

## Required validation on the host running Docker

Run these commands from the repository root:

```bash
docker compose config
docker compose up -d --build
docker compose ps

cd services/matching-go
go mod tidy
go test ./...
go build .
cd ../..
```

Then check the core services:

```bash
curl http://localhost:4010/health
curl http://localhost:4010/metrics
curl http://localhost:8000/docs
curl http://localhost:4002/api/drivers
```

The benchmark is intentionally separate from the full-stack check:

```bash
RUN_ID=$(date +%s) k6 run \
  --out json=matching-results-$(date +%s).json \
  -e VUS=1000 \
  -e DURATION=30s \
  benchmarks/k6/matching.js
```

Keep the output from each run with its command, date, hardware, Docker version, Go version, k6 version, VU count, duration, throughput, latency, and failure rate.
