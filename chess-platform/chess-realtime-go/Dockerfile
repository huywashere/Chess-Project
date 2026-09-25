# Stage 1: Build binary using lightweight Go Alpine image
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Download dependencies
COPY go.mod go.sum* ./
RUN go mod download

# Copy source code and compile optimized static binary
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o chess-realtime .

# Stage 2: Minimal runtime image (< 15MB)
FROM alpine:3.19

RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app
COPY --from=builder /app/chess-realtime .

ENV PORT=8085
EXPOSE 8085

CMD ["./chess-realtime"]
