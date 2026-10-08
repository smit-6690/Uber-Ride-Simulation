# MySQL transactional store

MySQL owns transactional ride and billing records in the resume-aligned architecture. MongoDB remains responsible for flexible customer, driver, profile, and media documents.

The schema in `init/001_schema.sql` is loaded automatically by Docker Compose on the first start of a fresh `mysql-data` volume.

The rides and billing services dual-write to this schema while retaining the existing MongoDB documents and Kafka event flow. `MYSQL_REQUIRED=true` is used by the Docker Compose stack so transactional writes fail fast if MySQL is unavailable.
