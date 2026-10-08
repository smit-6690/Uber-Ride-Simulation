# MySQL integration

The ride and billing services now dual-write transactional data:

- MongoDB continues to store the existing ride and billing documents.
- MySQL stores normalized `rides` and `billing_records` rows.
- Kafka still carries the `ride-completed` event from rides to billing.
- Redis continues to support ride-cache invalidation and Go driver reservations.

The Compose configuration provides MySQL at `mysql:3306` and sets
`MYSQL_REQUIRED=true` for the rides and billing services. The services will
fail fast when MySQL is unavailable in the containerized stack. For local
development without MySQL, set `MYSQL_REQUIRED=false`; synchronization errors
will be logged while the existing MongoDB path continues to work.

## Verify the integration

From the repository root:

```bash
docker compose up -d mysql redis matching-service
docker compose ps
docker compose exec mysql mysql -uuber_app -puber_password uber_simulation \
  -e "SHOW TABLES;"
```

After creating a ride and completing it, inspect the relational records:

```bash
docker compose exec mysql mysql -uuber_app -puber_password uber_simulation \
  -e "SELECT ride_id, status, estimated_price, actual_price FROM rides ORDER BY created_at DESC LIMIT 5;"

docker compose exec mysql mysql -uuber_app -puber_password uber_simulation \
  -e "SELECT billing_id, ride_id, amount, payment_status FROM billing_records ORDER BY created_at DESC LIMIT 5;"
```
