# Terminal Backend Portfolio

A terminal-inspired backend engineering portfolio built with Next.js, Payload CMS, Tailwind CSS, and SQLite.

## Local development

```bash
cp .env.example .env
pnpm install
pnpm payload migrate
pnpm seed
pnpm dev
```

Open `http://localhost:3000` for the portfolio and `http://localhost:3000/admin` for Payload Admin. The seed command is idempotent: it updates portfolio settings and creates missing sample projects without duplicating existing projects.

## Environment

```text
DATABASE_URL=file:./portfolio.db
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

Contact mail is sent with Resend. `CONTACT_TO_EMAIL` overrides the public contact address configured in Payload. Cloudflare R2 is enabled when all five `R2_*` values are present; local uploads remain available when they are omitted. The Node deployment uses Payload's official S3 adapter against R2's S3-compatible API, as recommended by Payload for non-Workers environments.

Cloudflare Turnstile protects contact submissions and star mutations. Create one widget in Cloudflare, set its public site key and secret above, and allow the deployment hostname. `TURNSTILE_ALLOWED_HOSTNAMES` is optional; when provided, Siteverify responses must match one of its comma-separated entries.

## Content model

- `projects`: draft-enabled project content, topics, media, links, and display metadata
- `media`: optimized image uploads with required alternative text, captions, focal points, and optional R2 storage
- `project-stars`: private, compound-unique anonymous star records
- `portfolio-settings`: hero content, actions, contact details, social links, and rotation timing

Public queries enforce published status. Draft projects are excluded from the landing page, project index, detail routes, related projects, and sitemap.

## Commands

```bash
pnpm dev                 # start development server
pnpm build               # create the production build
pnpm start               # run the production build
pnpm lint                # run ESLint
pnpm generate:types      # regenerate Payload types
pnpm generate:importmap  # regenerate Payload Admin imports
pnpm payload migrate     # apply database migrations
pnpm seed                # seed development portfolio content
```

## Docker

`docker compose up` starts the application with the local directory mounted into the container. The compose setup uses the same SQLite configuration as local development and does not require a separate database service.
