# ssh

An independently deployable Go service skeleton. It deliberately does not implement an SSH
protocol server yet; it exposes `GET /healthz` and `GET /` so the empty service can be deployed
and monitored safely from day one.

```bash
pnpm dev:ssh
pnpm ssh:build
pnpm ssh:docker
```

Build its container from the repository root:

```bash
docker build --file apps/ssh/Dockerfile --tag portfolio-ssh .
docker run --rm -p 8080:8080 portfolio-ssh
```
