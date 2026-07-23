FROM node:22.17.0-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN corepack enable && pnpm install --frozen-lockfile

FROM deps AS builder
WORKDIR /app
COPY . .

# Next.js renders data-backed routes during the build. Use a disposable SQLite
# database; Payload applies the checked-in migrations through prodMigrations.
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ARG R2_PUBLIC_URL
ENV DATABASE_URL=file:/tmp/portfolio-build.db
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY
ENV R2_PUBLIC_URL=$R2_PUBLIC_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN PAYLOAD_SECRET=build-only-placeholder pnpm build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir -p .next && chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Next traces the libSQL native package but does not preserve pnpm's optional
# dependency symlink. Recreate it for the image's CPU architecture.
RUN set -eu; \
  libsql_platform="linux-$(node -p 'process.arch')-musl"; \
  libsql_target="$(find /app/node_modules/.pnpm -type d -path "*/node_modules/@libsql/${libsql_platform}" -print -quit)"; \
  libsql_modules="$(find /app/node_modules/.pnpm -type d -path "*/libsql@*/node_modules" -print -quit)"; \
  test -n "$libsql_target"; \
  test -n "$libsql_modules"; \
  mkdir -p "$libsql_modules/@libsql"; \
  ln -s "$libsql_target" "$libsql_modules/@libsql/$libsql_platform"

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
