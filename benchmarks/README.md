# Performance verification

Performance results should come from repeatable runs rather than README assumptions. The k6 scenario exercises the Go matching endpoint and records request latency and failures.

Install k6, start the matching service and Redis, then run:

```bash
k6 run -e VUS=100 -e DURATION=60s benchmarks/k6/matching.js
```

For a higher-concurrency run:

```bash
k6 run -e VUS=1000 -e DURATION=60s benchmarks/k6/matching.js
```

Record p50/p95/p99 latency, throughput, error rate, and the exact machine/runtime configuration in `benchmarks/results/`. Report only measurements produced by the corresponding test run.
