package main

import (
	"fmt"
	"net/http"
	"sync/atomic"
	"time"
)

type matchingMetrics struct {
	RequestsTotal atomic.Uint64
	SuccessTotal  atomic.Uint64
	ErrorTotal    atomic.Uint64
	Status200     atomic.Uint64
	Status400     atomic.Uint64
	Status404     atomic.Uint64
	Status502     atomic.Uint64
	Status503     atomic.Uint64
	LatencyLE5ms  atomic.Uint64
	LatencyLE10ms atomic.Uint64
	LatencyLE25ms atomic.Uint64
	LatencyLE50ms atomic.Uint64
	LatencyLE100ms atomic.Uint64
	LatencyLE200ms atomic.Uint64
	LatencyLE500ms atomic.Uint64
	LatencyLE1s   atomic.Uint64
	LatencyGT1s  atomic.Uint64
}

var appMetrics matchingMetrics

type statusRecorder struct {
	http.ResponseWriter
	status int
}

func (recorder *statusRecorder) WriteHeader(status int) {
	recorder.status = status
	recorder.ResponseWriter.WriteHeader(status)
}

func (recorder *statusRecorder) Write(body []byte) (int, error) {
	if recorder.status == 0 {
		recorder.status = http.StatusOK
	}
	return recorder.ResponseWriter.Write(body)
}

func instrumentedHandler(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		started := time.Now()
		recorder := &statusRecorder{ResponseWriter: w}
		next.ServeHTTP(recorder, r)
		status := recorder.status
		if status == 0 {
			status = http.StatusOK
		}
		appMetrics.observe(status, time.Since(started))
	})
}

func (metrics *matchingMetrics) observe(status int, elapsed time.Duration) {
	metrics.RequestsTotal.Add(1)
	if status >= 200 && status < 300 {
		metrics.SuccessTotal.Add(1)
	} else {
		metrics.ErrorTotal.Add(1)
	}
	switch status {
	case http.StatusOK:
		metrics.Status200.Add(1)
	case http.StatusBadRequest:
		metrics.Status400.Add(1)
	case http.StatusNotFound:
		metrics.Status404.Add(1)
	case http.StatusBadGateway:
		metrics.Status502.Add(1)
	case http.StatusServiceUnavailable:
		metrics.Status503.Add(1)
	}

	ms := elapsed.Milliseconds()
	switch {
	case ms <= 5:
		metrics.LatencyLE5ms.Add(1)
	case ms <= 10:
		metrics.LatencyLE10ms.Add(1)
	case ms <= 25:
		metrics.LatencyLE25ms.Add(1)
	case ms <= 50:
		metrics.LatencyLE50ms.Add(1)
	case ms <= 100:
		metrics.LatencyLE100ms.Add(1)
	case ms <= 200:
		metrics.LatencyLE200ms.Add(1)
	case ms <= 500:
		metrics.LatencyLE500ms.Add(1)
	case ms <= 1000:
		metrics.LatencyLE1s.Add(1)
	default:
		metrics.LatencyGT1s.Add(1)
	}
}

func metricsHandler(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "text/plain; version=0.0.4")
	fmt.Fprintf(w, "# HELP matching_requests_total Total matching requests.\n# TYPE matching_requests_total counter\nmatching_requests_total %d\n", appMetrics.RequestsTotal.Load())
	fmt.Fprintf(w, "# HELP matching_success_total Successful matching requests.\n# TYPE matching_success_total counter\nmatching_success_total %d\n", appMetrics.SuccessTotal.Load())
	fmt.Fprintf(w, "# HELP matching_errors_total Failed matching requests.\n# TYPE matching_errors_total counter\nmatching_errors_total %d\n", appMetrics.ErrorTotal.Load())
	fmt.Fprintf(w, "matching_status_total{status=\"200\"} %d\n", appMetrics.Status200.Load())
	fmt.Fprintf(w, "matching_status_total{status=\"400\"} %d\n", appMetrics.Status400.Load())
	fmt.Fprintf(w, "matching_status_total{status=\"404\"} %d\n", appMetrics.Status404.Load())
	fmt.Fprintf(w, "matching_status_total{status=\"502\"} %d\n", appMetrics.Status502.Load())
	fmt.Fprintf(w, "matching_status_total{status=\"503\"} %d\n", appMetrics.Status503.Load())
	fmt.Fprintf(w, "# HELP matching_latency_milliseconds Latency buckets for matching requests.\n# TYPE matching_latency_milliseconds histogram\n")
	le5 := appMetrics.LatencyLE5ms.Load()
	le10 := le5 + appMetrics.LatencyLE10ms.Load()
	le25 := le10 + appMetrics.LatencyLE25ms.Load()
	le50 := le25 + appMetrics.LatencyLE50ms.Load()
	le100 := le50 + appMetrics.LatencyLE100ms.Load()
	le200 := le100 + appMetrics.LatencyLE200ms.Load()
	le500 := le200 + appMetrics.LatencyLE500ms.Load()
	le1s := le500 + appMetrics.LatencyLE1s.Load()
	fmt.Fprintf(w, "matching_latency_milliseconds_bucket{le=\"5\"} %d\n", le5)
	fmt.Fprintf(w, "matching_latency_milliseconds_bucket{le=\"10\"} %d\n", le10)
	fmt.Fprintf(w, "matching_latency_milliseconds_bucket{le=\"25\"} %d\n", le25)
	fmt.Fprintf(w, "matching_latency_milliseconds_bucket{le=\"50\"} %d\n", le50)
	fmt.Fprintf(w, "matching_latency_milliseconds_bucket{le=\"100\"} %d\n", le100)
	fmt.Fprintf(w, "matching_latency_milliseconds_bucket{le=\"200\"} %d\n", le200)
	fmt.Fprintf(w, "matching_latency_milliseconds_bucket{le=\"500\"} %d\n", le500)
	fmt.Fprintf(w, "matching_latency_milliseconds_bucket{le=\"1000\"} %d\n", le1s)
	fmt.Fprintf(w, "matching_latency_milliseconds_bucket{le=\"+Inf\"} %d\n", appMetrics.RequestsTotal.Load())
}
