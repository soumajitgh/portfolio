# Portfolio workspace

This is an Nx monorepo containing two independently buildable and deployable applications.

| App | Location | Runtime | Local port |
| --- | --- | --- | --- |
| `web` | `apps/web` | Next.js 16 + Payload CMS 3 | `3000` |
| `ssh` | `apps/ssh` | Go 1.26 | `23234` |

## Get started

Requirements: Node.js 20.9+, pnpm 11, Go 1.26+ (for local `ssh` development), and PostgreSQL
15+ for `web`.

```bash
pnpm install
cp apps/web/.env.example apps/web/.env
pnpm dev
```

`web` first reads `apps/web/.env` and falls back to the existing workspace-root `.env`, so current
local configuration continues to work. `pnpm dev` starts PostgreSQL, waits for its health check,
applies Payload migrations, then starts both applications. `docker compose up` starts the same
three services as containers; it reads the workspace-root `.env`.

## Nx commands

```bash
pnpm dev:web
pnpm web:build
pnpm web:docker

pnpm dev:ssh
pnpm ssh:build
pnpm ssh:docker
```

All project-specific targets are available through `pnpm exec nx show project web` and
`pnpm exec nx show project ssh`.

## Deploy independently

Each app owns a Dockerfile. Build either image from the workspace root so pnpm can use the shared
lockfile:

```bash
docker build --file apps/web/Dockerfile --tag portfolio-web .
docker build --file apps/ssh/Dockerfile --tag portfolio-ssh .
```

`web` listens on port `3000` and needs its Payload/PostgreSQL environment variables at runtime.
Set the public `NEXT_PUBLIC_*` values and `R2_PUBLIC_URL` as Docker build arguments as documented
in [the web app README](apps/web/README.md). The SSH container listens on port `23234`; mount an
`authorized_keys` file before exposing it publicly.

## Local SSH development

Start the Wish/Bubble Tea SSH server, then connect from a second terminal:

```bash
cd apps/ssh
go tool air

ssh -i ~/.ssh/id_ed25519 -p 23234 localhost
```

Press `q`, `Esc`, or `Ctrl+C` to leave the terminal interface. See the
[SSH app README](apps/ssh/README.md) for authentication and deployment details.

## App documentation

The original portfolio setup, CMS configuration, environment reference, and Payload deployment
notes live in [apps/web/README.md](apps/web/README.md).
