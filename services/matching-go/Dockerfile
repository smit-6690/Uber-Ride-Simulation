FROM golang:1.22-alpine AS builder
WORKDIR /src
COPY go.mod ./
COPY . ./
RUN go mod tidy && CGO_ENABLED=0 GOOS=linux go build -o /matching-service .

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=builder /matching-service /matching-service
EXPOSE 4010
ENTRYPOINT ["/matching-service"]
