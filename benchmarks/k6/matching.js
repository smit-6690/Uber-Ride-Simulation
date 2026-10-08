import http from "k6/http";
import { check } from "k6";

export const options = {
  scenarios: {
    matching: {
      executor: "constant-vus",
      vus: Number(__ENV.VUS || 100),
      duration: __ENV.DURATION || "60s",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(99)<200"],
  },
};

export default function () {
  const runId = __ENV.RUN_ID || "local";
  const payload = JSON.stringify({
    pickup: { latitude: 37.7749, longitude: -122.4194 },
    drivers: [
      {
        driverId: `driver-${runId}-${__VU}-${__ITER}`,
        location: { latitude: 37.775, longitude: -122.4195 },
        available: true,
      },
    ],
  });

  const response = http.post(
    `${__ENV.BASE_URL || "http://localhost:4010"}/api/v1/match`,
    payload,
    {
      headers: { "Content-Type": "application/json" },
    },
  );
  check(response, { "matching request succeeded": (r) => r.status === 200 });
}
