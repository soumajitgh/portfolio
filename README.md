# Terminal Backend Portfolio

A production-oriented backend engineering portfolio built with Next.js 16, Payload CMS 3,
Tailwind CSS, and libSQL. It includes a Payload Admin workspace, draft-enabled projects and blog
posts, search and topic filtering, anonymous star counters, Resend contact delivery, Cloudflare
Turnstile protection, optional R2 media storage, and a read-only Payload MCP endpoint.

## Local development

Requirements: Node.js 20.9+ and pnpm 11.

```bash
cp .env.example .env
pnpm install
pnpm payload migrate
pnpm seed
pnpm dev
```

Open `http://localhost:3000` for the portfolio and `http://localhost:3000/admin` for Payload
Admin. The seed command is idempotent: it updates portfolio settings and creates missing sample
content without duplicating existing records.

## Environment

```text
# Local SQLite
DATABASE_URL=file:./portfolio.db
DATABASE_AUTH_TOKEN=

# Hosted libSQL in production
# DATABASE_URL=libsql://YOUR-DATABASE-HOST
# DATABASE_AUTH_TOKEN=YOUR-DATABASE-TOKEN

PAYLOAD_SECRET=replace-with-a-long-random-secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000

RESEND_API_KEY=re_...
EMAIL_FROM_ADDRESS=contact@your-domain.com
EMAIL_FROM_NAME=soumajit.dev
CONTACT_TO_EMAIL=soumojitghosh02@gmail.com

NEXT_PUBLIC_TURNSTILE_SITE_KEY=...
TURNSTILE_SECRET_KEY=...
TURNSTILE_ALLOWED_HOSTNAMES=your-domain.com

R2_BUCKET=portfolio-media
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_ENDPOINT=https://ACCOUNT_ID.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://media.your-domain.com
```

`DATABASE_AUTH_TOKEN` can stay empty for a local file database. Contact mail is sent with Resend;
`CONTACT_TO_EMAIL` overrides the public contact address configured in Payload. Turnstile protects
contact submissions and star mutations. `TURNSTILE_ALLOWED_HOSTNAMES` is an optional
comma-separated allowlist.

Cloudflare R2 is enabled only when all five `R2_*` values are present. Otherwise Payload uses local
uploads, which are suitable for development but not an ephemeral production container.

## Payload MCP

The MCP endpoint is `POST /api/mcp`. It exposes read-only access to:

- `blog-posts`: find
- `projects`: find
- `portfolio-settings`: find

Create an API key after the database migrations have run:

1. Sign in at `/admin`.
2. Open **MCP → API Keys** and create a key associated with an admin user.
3. Enable the permitted `find` capabilities and copy the generated key.
4. Configure an MCP client with the production endpoint and Bearer token:

```json
{
  "mcpServers": {
    "Portfolio": {
      "type": "http",
      "url": "https://your-domain.com/api/mcp",
      "headers": {
        "Authorization": "Bearer MCP-USER-API-KEY"
      }
    }
  }
}
```

The plugin configuration and API-key toggles are both enforced, along with the existing Payload
collection access rules. Create, update, and delete operations are disabled in code.

## Content model

- `projects`: draft-enabled project content, topics, media, links, and display metadata
- `blog-posts`: draft-enabled engineering articles with labels and issue numbers
- `media`: optimized uploads with alt text, captions, focal points, and optional R2 storage
- `project-stars` and `blog-stars`: private anonymous star records
- `portfolio-settings`: hero, contact, social, resume, and home-page display settings
- `payload-mcp-api-keys`: authenticated MCP client keys and per-capability permissions

Public queries enforce published status. Draft content is excluded from pages, related content,
feeds, and the sitemap.

## Commands

```bash
pnpm dev                 # start the development server
pnpm build               # create the standalone production build
pnpm start               # run a local production build
pnpm lint                # run ESLint
pnpm test:int            # run integration tests
pnpm test:e2e            # run Playwright tests
pnpm generate:types      # regenerate Payload types
pnpm generate:importmap  # regenerate Payload Admin imports
pnpm payload migrate     # apply pending database migrations
pnpm seed                # seed development content
```

Schema pushing is disabled. Checked-in migrations are applied automatically when Payload
initializes in production; local development should run `pnpm payload migrate` after pulling schema
changes.

## Docker and Dokploy

The Dockerfile builds a Next.js standalone image as the non-root `nextjs` user. It uses a disposable
SQLite database only while prerendering build-time pages. The running application connects to the
hosted libSQL instance supplied through environment variables.

Create a Dokploy application from this repository with:

- Build type: `Dockerfile`
- Dockerfile path: `Dockerfile`
- Container port: `3000`
- Health check path: `/`
- HTTPS domain: your public portfolio domain
- Persistent volume: not required when using hosted libSQL and R2

Set these build arguments because Next.js embeds public values and image host configuration during
the image build:

```text
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_TURNSTILE_SITE_KEY=...
R2_PUBLIC_URL=https://media.your-domain.com
```

Set the complete environment list from the Environment section as runtime variables, especially:

```text
DATABASE_URL=libsql://YOUR-DATABASE-HOST
DATABASE_AUTH_TOKEN=YOUR-DATABASE-TOKEN
PAYLOAD_SECRET=YOUR-LONG-RANDOM-SECRET
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Deploy a single application instance while automatic production migrations are enabled. If the
application is scaled horizontally later, move migrations to a one-off pre-deploy job so only one
runner migrates the database.

## License

MIT
