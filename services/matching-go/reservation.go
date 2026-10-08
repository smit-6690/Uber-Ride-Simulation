package main

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

type ReservationStore interface {
	Reserve(ctx context.Context, driverID string, ttl time.Duration) (bool, error)
}

type redisReservationStore struct {
	client *redis.Client
}

func (store *redisReservationStore) Reserve(ctx context.Context, driverID string, ttl time.Duration) (bool, error) {
	if driverID == "" {
		return false, fmt.Errorf("driver ID cannot be empty")
	}
	return store.client.SetNX(ctx, "driver:reservation:"+driverID, "reserved", ttl).Result()
}

func newRedisReservationStore(addr string) *redisReservationStore {
	return &redisReservationStore{client: redis.NewClient(&redis.Options{Addr: addr})}
}
