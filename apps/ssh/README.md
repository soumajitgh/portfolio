# SSH service

A Wish v2 SSH server. It generates an Ed25519 host key when the configured key path does not
exist and handles `SIGINT`/`SIGTERM` with a graceful shutdown. Each SSH session runs an isolated
Bubble Tea v2 program in the terminal's alternate screen.

The default address is `127.0.0.1:23234`; use an explicit public bind address only when deploying
behind the intended network controls.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `SSH_ADDRESS` | `127.0.0.1:23234` | Address on which the server listens. |
| `SSH_HOST_KEY_PATH` | `./.ssh/id_ed25519` | Persistent server host-key path. |
| `SSH_AUTHORIZED_KEYS_PATH` | Unset | Public keys allowed to connect. Required for non-local deployments. |
| `SSH_IDLE_TIMEOUT` | `10m` | Idle connection timeout. |
| `SSH_MAX_TIMEOUT` | `1h` | Absolute connection timeout. |
| `SSH_SHUTDOWN_TIMEOUT` | `30s` | Graceful-shutdown deadline. |

## Local development

Start the server with Air. It rebuilds and gracefully restarts the process whenever Go source
changes:

```bash
go tool air
```

In another terminal, connect with a local public key:

```bash
ssh -i ~/.ssh/id_ed25519 -p 23234 localhost
```

If your SSH agent has a key loaded, `ssh -p 23234 localhost` also works. Accept the host-key
prompt on the first connection. Air restarts disconnect active SSH sessions, so reconnect after a
source change. Press `q`, `Esc`, or `Ctrl+C` to leave the Bubble Tea interface.

If authentication fails, create a local test key:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519
```

For loopback development, any client public key is accepted. For deployments, set
`SSH_AUTHORIZED_KEYS_PATH` to an `authorized_keys` file before exposing the service.

Build the container from the repository root and persist its generated host key:

```bash
docker build --file apps/ssh/Dockerfile --tag portfolio-ssh .
docker run --rm -p 23234:23234 \
  -v ssh-data:/data \
  -v "$PWD/.ssh/authorized_keys:/run/secrets/authorized_keys:ro" \
  portfolio-ssh
```
