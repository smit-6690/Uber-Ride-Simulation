package main

import (
	"context"
	"math"
	"testing"
	"time"
)

type fakeReservationStore struct {
	reserved map[string]bool
}

func (store *fakeReservationStore) Reserve(_ context.Context, driverID string, _ time.Duration) (bool, error) {
	if store.reserved[driverID] {
		return false, nil
	}
	store.reserved[driverID] = true
	return true, nil
}

func TestHaversineDistance(t *testing.T) {
	a := Location{Latitude: 37.7749, Longitude: -122.4194}
	b := Location{Latitude: 37.3382, Longitude: -121.8863}
	distance := haversineKM(a, b)
	if math.Abs(distance-67.6) > 1.0 {
		t.Fatalf("expected approximately 67.6 km, got %.2f", distance)
	}
}

func TestNearestAvailableDriverSkipsBusyDrivers(t *testing.T) {
	pickup := Location{Latitude: 37.7749, Longitude: -122.4194}
	drivers := []Driver{
		{ID: "busy-nearby", Location: Location{Latitude: 37.7750, Longitude: -122.4195}, Available: false},
		{ID: "available-farther", Location: Location{Latitude: 37.7849, Longitude: -122.4094}, Available: true},
	}

	driver, _, found := nearestAvailableDriver(pickup, drivers)
	if !found || driver.ID != "available-farther" {
		t.Fatalf("expected available-farther, got %+v (found=%v)", driver, found)
	}
}

func TestReserveNearestAvailableDriverFallsBackAfterConflict(t *testing.T) {
	pickup := Location{Latitude: 37.7749, Longitude: -122.4194}
	drivers := []Driver{
		{ID: "nearest", Location: Location{Latitude: 37.7750, Longitude: -122.4195}, Available: true},
		{ID: "fallback", Location: Location{Latitude: 37.7760, Longitude: -122.4185}, Available: true},
	}
	store := &fakeReservationStore{reserved: map[string]bool{"nearest": true}}

	driver, _, found, err := reserveNearestAvailableDriver(context.Background(), store, pickup, drivers, time.Minute)
	if err != nil {
		t.Fatalf("unexpected reservation error: %v", err)
	}
	if !found || driver.ID != "fallback" {
		t.Fatalf("expected fallback driver, got %+v (found=%v)", driver, found)
	}
}
