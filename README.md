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
```

Use persistent storage for the SQLite database and uploaded media in production.

## Content model

- `projects`: draft-enabled project content, topics, media, links, and display metadata
- `media`: optimized image uploads with required alternative text, captions, and focal points
- `project-stars`: private, compound-unique anonymous star records
- `portfolio-settings`: hero content, interests, grouped skills, actions, and rotation timing

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
