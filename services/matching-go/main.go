package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"
	"os"
	"strconv"
	"time"
)

type Location struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

type Driver struct {
	ID              string    `json:"driverId"`
	Location        Location  `json:"location"`
	CurrentLocation *Location `json:"currentLocation,omitempty"`
	Available       bool      `json:"available"`
}

type MatchRequest struct {
	Pickup  Location `json:"pickup"`
	Drivers []Driver `json:"drivers,omitempty"`
}

type MatchResponse struct {
	DriverID    string  `json:"driverId"`
	DistanceKM  float64 `json:"distanceKm"`
	MatchedAt   string  `json:"matchedAt"`
}

var (
	reservationStore *redisReservationStore
	reservationTTL   = 120 * time.Second
)

func haversineKM(a, b Location) float64 {
	const earthRadiusKM = 6371.0
	lat1 := a.Latitude * math.Pi / 180
	lat2 := b.Latitude * math.Pi / 180
	dLat := (b.Latitude - a.Latitude) * math.Pi / 180
	dLon := (b.Longitude - a.Longitude) * math.Pi / 180

	h := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Cos(lat1)*math.Cos(lat2)*math.Sin(dLon/2)*math.Sin(dLon/2)
	return earthRadiusKM * 2 * math.Atan2(math.Sqrt(h), math.Sqrt(1-h))
}

func nearestAvailableDriver(pickup Location, drivers []Driver) (Driver, float64, bool) {
	var nearest Driver
	minDistance := math.Inf(1)
	found := false
	for _, driver := range drivers {
		if !driver.Available {
			continue
		}
		location := driver.Location
		if driver.CurrentLocation != nil {
			location = *driver.CurrentLocation
		}
		distance := haversineKM(pickup, location)
		if distance < minDistance {
			nearest = driver
			minDistance = distance
			found = true
		}
	}
	return nearest, minDistance, found
}

func reserveNearestAvailableDriver(ctx context.Context, store ReservationStore, pickup Location, drivers []Driver, ttl time.Duration) (Driver, float64, bool, error) {
	remaining := append([]Driver(nil), drivers...)
	for len(remaining) > 0 {
		driver, distance, found := nearestAvailableDriver(pickup, remaining)
		if !found {
			return Driver{}, 0, false, nil
		}
		reserved, err := store.Reserve(ctx, driver.ID, ttl)
		if err != nil {
			return Driver{}, 0, false, err
		}
		if reserved {
			return driver, distance, true, nil
		}
		filtered := make([]Driver, 0, len(remaining)-1)
		for _, candidate := range remaining {
			if candidate.ID != driver.ID {
				filtered = append(filtered, candidate)
			}
		}
		remaining = filtered
	}
	return Driver{}, 0, false, nil
}

func loadDrivers(client *http.Client, serviceURL string) ([]Driver, error) {
	request, err := http.NewRequest(http.MethodGet, serviceURL+"/api/drivers", nil)
	if err != nil {
		return nil, err
	}
	response, err := client.Do(request)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("driver service returned status %d", response.StatusCode)
	}

	var drivers []Driver
	if err := json.NewDecoder(response.Body).Decode(&drivers); err != nil {
		return nil, err
	}
	for i := range drivers {
		if drivers[i].CurrentLocation != nil {
			drivers[i].Location = *drivers[i].CurrentLocation
		}
		// Availability will become a persisted driver field in the next slice.
		drivers[i].Available = true
	}
	return drivers, nil
}

func jsonHandler(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func matchHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		jsonHandler(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	var request MatchRequest
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&request); err != nil {
		jsonHandler(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}
	if request.Pickup.Latitude < -90 || request.Pickup.Latitude > 90 || request.Pickup.Longitude < -180 || request.Pickup.Longitude > 180 {
		jsonHandler(w, http.StatusBadRequest, map[string]string{"error": "pickup coordinates are invalid"})
		return
	}

	drivers := request.Drivers
	if len(drivers) == 0 {
		serviceURL := os.Getenv("DRIVER_SERVICE_URL")
		if serviceURL == "" {
			serviceURL = "http://drivers-service:4002"
		}
		var err error
		drivers, err = loadDrivers(http.DefaultClient, serviceURL)
		if err != nil {
			jsonHandler(w, http.StatusBadGateway, map[string]string{"error": "driver service unavailable"})
			return
		}
	}

	if reservationStore == nil {
		jsonHandler(w, http.StatusServiceUnavailable, map[string]string{"error": "reservation store unavailable"})
		return
	}

	driver, distance, found, err := reserveNearestAvailableDriver(r.Context(), reservationStore, request.Pickup, drivers, reservationTTL)
	if err != nil {
		jsonHandler(w, http.StatusBadGateway, map[string]string{"error": "reservation failed"})
		return
	}
	if !found {
		jsonHandler(w, http.StatusNotFound, map[string]string{"error": "no available drivers"})
		return
	}
	jsonHandler(w, http.StatusOK, MatchResponse{
		DriverID:   driver.ID,
		DistanceKM: math.Round(distance*100) / 100,
		MatchedAt:  time.Now().UTC().Format(time.RFC3339),
	})
}

func main() {
	port := os.Getenv("MATCHING_PORT")
	if port == "" {
		port = "4010"
	}
	if _, err := strconv.Atoi(port); err != nil {
		log.Fatalf("invalid MATCHING_PORT: %v", err)
	}

	redisAddr := os.Getenv("REDIS_ADDR")
	if redisAddr == "" {
		redisAddr = "redis:6379"
	}
	if configuredTTL, err := strconv.Atoi(os.Getenv("RESERVATION_TTL_SECONDS")); err == nil && configuredTTL > 0 {
		reservationTTL = time.Duration(configuredTTL) * time.Second
	}
	reservationStore = newRedisReservationStore(redisAddr)
	startupContext, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := reservationStore.client.Ping(startupContext).Err(); err != nil {
		log.Fatalf("reservation store unavailable: %v", err)
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/health", func(w http.ResponseWriter, _ *http.Request) {
		jsonHandler(w, http.StatusOK, map[string]string{"status": "ok", "service": "matching-go"})
	})
	mux.Handle("/api/v1/match", instrumentedHandler(http.HandlerFunc(matchHandler)))
	mux.HandleFunc("/metrics", metricsHandler)

	server := &http.Server{Addr: ":" + port, Handler: mux, ReadHeaderTimeout: 5 * time.Second}
	log.Printf("matching-go listening on %s", server.Addr)
	log.Fatal(server.ListenAndServe())
}
