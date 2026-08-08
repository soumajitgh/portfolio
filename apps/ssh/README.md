# SSH service

A Wish v2 SSH server. It accepts only public keys in the configured `authorized_keys` file,
generates an Ed25519 host key when the configured key path does not exist, and handles
`SIGINT`/`SIGTERM` with a graceful shutdown.

The default address is `127.0.0.1:23234`; use an explicit public bind address only when deploying
behind the intended network controls.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `SSH_ADDRESS` | `127.0.0.1:23234` | Address on which the server listens. |
| `SSH_HOST_KEY_PATH` | `./.ssh/id_ed25519` | Persistent server host-key path. |
| `SSH_AUTHORIZED_KEYS_PATH` | `./.ssh/authorized_keys` | Public keys allowed to connect. |
| `SSH_IDLE_TIMEOUT` | `10m` | Idle connection timeout. |
| `SSH_MAX_TIMEOUT` | `1h` | Absolute connection timeout. |
| `SSH_SHUTDOWN_TIMEOUT` | `30s` | Graceful-shutdown deadline. |

```bash
mkdir -p .ssh
ssh-keygen -t ed25519 -f .ssh/id_ed25519 -N ''
cp /path/to/allowed-client-key.pub .ssh/authorized_keys
go run ./cmd/ssh
```

Build the container from the repository root and persist its generated host key:

```bash
docker build --file apps/ssh/Dockerfile --tag portfolio-ssh .
docker run --rm -p 23234:23234 \
  -v ssh-data:/data \
  -v "$PWD/.ssh/authorized_keys:/run/secrets/authorized_keys:ro" \
  portfolio-ssh
```
