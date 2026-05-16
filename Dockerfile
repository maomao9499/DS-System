# Stage 1: Install dependencies (including devDeps for prisma CLI)
FROM node:22-alpine AS deps
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --ignore-scripts

# Stage 2: Build the Next.js app
FROM node:22-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV SKIP_ENV_VALIDATION=1

RUN npx prisma generate
RUN pnpm run build

# Stage 3: Production runner
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy standalone output (server.js + .next)
COPY --from=builder /app/.next/standalone ./

# Discard standalone's minimal node_modules — use pnpm for full control
RUN rm -rf node_modules

# Copy public/ and .next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# Copy prisma schema & migrations
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

# Install all deps with pnpm and generate Prisma client
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
RUN npm install -g pnpm \
    && pnpm install --ignore-scripts \
    && npx prisma generate

# Entrypoint
COPY scripts/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/docker-entrypoint.sh"]
