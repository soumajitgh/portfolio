# Terminal Backend Portfolio

A production-oriented fullstack developer portfolio built with Next.js 16, Payload CMS 3,
Tailwind CSS, and PostgreSQL. It includes a Payload Admin workspace, draft-enabled projects and blog
posts, search and topic filtering, anonymous star counters, Resend contact delivery, Cloudflare
Turnstile protection, optional R2 media storage, and an authenticated Payload MCP endpoint.

## Local development

Requirements: Node.js 20.9+, pnpm 11, and PostgreSQL 15+.

```bash
cp .env.example .env
docker compose up -d postgres
pnpm install
pnpm payload migrate
pnpm seed
pnpm dev
```

Open `http://localhost:3000` for the portfolio and `http://localhost:3000/admin` for Payload
Admin. The seed command is idempotent: it updates portfolio settings and creates missing sample
projects, tracked repositories, OSS contributions, and blog content without duplicating existing
records. It is intended for local development and refuses to run when `NODE_ENV=production`.
Contribution fixtures bypass live GitHub requests so local setup is deterministic and does not
consume API rate limits.

To run both PostgreSQL and the application in containers instead, use `docker compose up`. Compose
waits for PostgreSQL to become healthy, applies pending migrations, and then starts Payload. The
`postgres_data` volume preserves local database data between restarts. Set `POSTGRES_PORT` if port
5432 is already occupied.

## Environment

```text
DATABASE_URL=postgresql://payload:payload@localhost:5432/portfolio

PAYLOAD_SECRET=replace-with-a-long-random-secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000

NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=phc_CaLtPZDA7oPnyivEYP4XpXB8qUXx5wfsmeZvgzdVgtdY
NEXT_PUBLIC_POSTHOG_HOST=https://t.soumajit.dev

LEETCODE_USERNAME=soumajitgh
GITHUB_USERNAME=soumajitgh
GITHUB_TOKEN=github_pat_...
ENABLE_GITHUB_SYNC_WORKER=true
WAKATIME_API_KEY=waka_...

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

Use the PostgreSQL connection URL supplied by the hosting provider in production. Contact mail is
sent with Resend; `CONTACT_TO_EMAIL` overrides the public contact address configured in Payload.
Turnstile protects contact submissions and star mutations. `TURNSTILE_ALLOWED_HOSTNAMES` is an
optional comma-separated allowlist.

The `/stats` dashboard reads LeetCode through alfa-leetcode-api and GitHub through the public REST
API. `LEETCODE_USERNAME` and `GITHUB_USERNAME` default to `soumajitgh`. A server-only, read-only
`GITHUB_TOKEN` enables the detailed contribution graph, tracked-repository syncing, and higher API
rate limits. To include private commit counts or track private repositories, use a fine-grained
token owned by the profile user with access to those repositories. The dashboard requests only each
private repository's visibility and aggregate commit count; it never requests or renders private
repository names.
`WAKATIME_API_KEY` is required for private WakaTime activity and is only read on the server; never
expose either token through a `NEXT_PUBLIC_` variable.

Add repositories once in the Tracked Repositories collection. Payload searches each enabled
repository for pull requests opened by its configured GitHub username, creates missing OSS
Contributions, and refreshes existing GitHub facts every two hours. The persisted `nextSyncAt`
cache prevents duplicate GitHub requests when the worker runs more often; explicit **Refresh now**
is the only cache bypass. Syncs are sequential and use one GitHub GraphQL request for up to 100 PRs
per repository page. Portfolio summaries, tags, ordering, featured state, and visibility are never
overwritten.

`GITHUB_TOKEN` is required for tracked-repository GraphQL sync. Use a read-only token with access to
any private repositories you want to track. `GITHUB_USERNAME` defaults new trackers to `soumajitgh`.
`ENABLE_GITHUB_SYNC_WORKER=true` runs Payload's persistent job worker in the Next.js process, which
fits the documented Docker/Dokploy deployment. Set it to `false` only if a separate process runs
`pnpm payload jobs:run --cron "* * * * *" --queue github-contributions --handle-schedules`.
When WakaTime reports AI activity, the stats dashboard and `/stats/ai` detail page show AI-vs-human
line changes, adoption percentage, prompts, sessions, tokens, per-model and per-project usage, and
estimated cost. The section remains behind an informative empty state until an AI-enabled WakaTime
plugin or agent reports data.

Cloudflare R2 is enabled only when all five `R2_*` values are present. Otherwise Payload uses local
uploads, which are suitable for development but not an ephemeral production container.

## Analytics

PostHog is enabled on the public portfolio only when `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` is set.
Use the public project token from PostHog project settings, not a personal API key. Events are
sent through `https://t.soumajit.dev`, the managed reverse proxy; PostHog links open in the EU UI.

The integration captures SPA page views and exits, Core Web Vitals and network performance,
JavaScript exceptions, heatmaps, dead clicks, and privacy-masked session replays. It also records
the following decision-oriented custom events:

- Content engagement: `content_engaged`, `content_scroll_depth_reached`,
  `content_view_completed`, and `content_selected`
- Discovery: `content_search_performed`, `content_search_cleared`,
  `content_filter_changed`, and `in_page_navigation_clicked`
- Conversion and intent: `contact_form_submitted`, `contact_form_succeeded`,
  `contact_form_failed`, `resume_download_requested`, and `contact_link_clicked`
- Advocacy: `content_star_updated`, `content_star_failed`, `content_shared`,
  `content_share_failed`, `content_link_copied`, and `content_link_copy_failed`
- Navigation: `external_link_clicked`, `portfolio_panel_selected`, and
  `portfolio_panel_pin_changed`

Payload Admin is excluded. Session replay masks every input, strips query strings from recorded
network URLs, and the contact form is excluded from autocapture. Analytics also honors the
browser's Do Not Track signal. No contact-form values are sent in custom events.

## Payload MCP

The MCP endpoint is `POST /api/mcp`. It exposes:

- `blog-posts`: find, create, update, and delete
- `oss-contributions`: find, create, update, and delete
- `projects`: find, create, update, and delete
- `tracked-repositories`: find, create, update, and delete
- `portfolio-settings`: find and update

Create an API key after the database migrations have run:

1. Sign in at `/admin`.
2. Open **MCP → API Keys** and create a key associated with an admin user.
3. Enable the capabilities that client should receive and copy the generated key.
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
collection access rules. The MCP key must be associated with an authenticated user for write
operations.

## Content model

- `projects`: draft-enabled project content, topics, media, links, and display metadata
- `tracked-repositories`: repository-level GitHub discovery, cache, rate-limit, and sync state
- `oss-contributions`: GitHub PR facts plus manually controlled portfolio summaries and visibility
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
pnpm seed                # idempotently seed local development content through Payload Local API
```

Schema pushing is disabled. Checked-in migrations are applied automatically when Payload
initializes in production; local development should run `pnpm payload migrate` after pulling schema
changes.

## Docker and Dokploy

The Dockerfile builds a Next.js standalone image as the non-root `nextjs` user. Payload-backed
routes render dynamically, so image builds do not connect to PostgreSQL. The running application
uses the PostgreSQL instance supplied through `DATABASE_URL`.

Create a PostgreSQL database and an application in the same Dokploy environment. Configure the
application with:

- Build type: `Dockerfile`
- Dockerfile path: `Dockerfile`
- Container port: `3000`
- Health check path: `/`
- HTTPS domain: your public portfolio domain
- Persistent volume: not required for the application when using PostgreSQL and R2

Set these build arguments because Next.js embeds public values and image host configuration during
the image build:

```text
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_TURNSTILE_SITE_KEY=...
NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=phc_CaLtPZDA7oPnyivEYP4XpXB8qUXx5wfsmeZvgzdVgtdY
NEXT_PUBLIC_POSTHOG_HOST=https://t.soumajit.dev
R2_PUBLIC_URL=https://media.your-domain.com
```

Set the complete environment list from the Environment section as runtime variables, especially:

```text
DATABASE_URL=postgresql://USER:PASSWORD@DOKPLOY_POSTGRES_HOST:5432/DATABASE
PAYLOAD_SECRET=YOUR-LONG-RANDOM-SECRET
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Use Dokploy's internal PostgreSQL connection URL when the application and database are on the same
network. Do not embed `DATABASE_URL` as a Docker build argument. If a password contains URL-reserved
characters, use the exact URL emitted by Dokploy or percent-encode the password.

Deploy a single application instance while automatic production migrations are enabled. If the
application is scaled horizontally later, move migrations to a one-off pre-deploy job so only one
runner migrates the database.

## License

MIT
