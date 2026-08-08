FROM golang:1.25-alpine AS builder

WORKDIR /src
COPY apps/ssh/go.mod ./
COPY apps/ssh/go.sum ./
RUN go mod download

COPY apps/ssh/cmd ./cmd
COPY apps/ssh/internal ./internal
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/ssh ./cmd/ssh

FROM alpine:3.22

RUN addgroup -S app && adduser -S -G app app
COPY --from=builder /out/ssh /usr/local/bin/ssh
RUN mkdir /data && chown app:app /data

USER app
ENV SSH_ADDRESS=:23234 \
    SSH_HOST_KEY_PATH=/data/ssh_host_ed25519 \
    SSH_AUTHORIZED_KEYS_PATH=/run/secrets/authorized_keys
EXPOSE 23234

CMD ["/usr/local/bin/ssh"]
