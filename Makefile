.PHONY: test build up down logs benchmark compose-config mysql-check

test:
	cd services/matching-go && go test ./...
	for service in rides billing drivers customers admin; do node --check services/$$service/app.js; done

build:
	cd services/matching-go && go build .

compose-config:
	docker compose config

up:
	docker compose up -d --build

down:
	docker compose down

logs:
	docker compose logs -f --tail=100

benchmark:
	RUN_ID=$$(date +%s) k6 run --out json=matching-results-$$(date +%s).json benchmarks/k6/matching.js

mysql-check:
	docker compose exec mysql mysql -uuber_app -puber_password uber_simulation -e "SHOW TABLES;"
