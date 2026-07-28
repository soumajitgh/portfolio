FROM golang:1.24-alpine AS builder

WORKDIR /src
COPY apps/ssh/go.mod ./
COPY apps/ssh/main.go ./
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/ssh .

FROM alpine:3.22

RUN addgroup -S app && adduser -S -G app app
COPY --from=builder /out/ssh /usr/local/bin/ssh

USER app
ENV PORT=8080
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1

CMD ["/usr/local/bin/ssh"]
