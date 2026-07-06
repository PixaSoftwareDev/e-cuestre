# ─────────────────────────────────────────────────────────────
# Ecuestre — imagen de producción (Next.js standalone + Prisma)
# ─────────────────────────────────────────────────────────────
FROM node:24-alpine AS base
# libc6-compat y openssl son necesarios para los engines de Prisma.
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable
WORKDIR /app

# ── Dependencias ──────────────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile
# Genera el cliente Prisma con los engines de Alpine (musl).
RUN pnpm exec prisma generate

# ── Build ─────────────────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Las variables NEXT_PUBLIC_* se inlinan en build-time: hay que pasarlas como
# build args (docker-compose las toma del .env automáticamente).
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_SITE_NAME
ARG NEXT_PUBLIC_PAYPAL_CLIENT_ID
ARG NEXT_PUBLIC_PAYPAL_CURRENCY
ARG NEXT_PUBLIC_SESSION_RECORDING
ARG NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_SITE_NAME=$NEXT_PUBLIC_SITE_NAME \
    NEXT_PUBLIC_PAYPAL_CLIENT_ID=$NEXT_PUBLIC_PAYPAL_CLIENT_ID \
    NEXT_PUBLIC_PAYPAL_CURRENCY=$NEXT_PUBLIC_PAYPAL_CURRENCY \
    NEXT_PUBLIC_SESSION_RECORDING=$NEXT_PUBLIC_SESSION_RECORDING \
    NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH \
    NEXT_TELEMETRY_DISABLED=1
# El build no necesita conexión a la base; solo tipa y compila.
RUN pnpm build

# ── Runner ────────────────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# App standalone (server mínimo con node_modules traceado).
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Prisma CLI + engines + migraciones, para correr `migrate deploy` al arrancar.
COPY --from=deps /app/node_modules/prisma ./node_modules/prisma
COPY --from=deps /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma
COPY docker/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Carpeta de subidas (se monta como volumen para persistir imágenes).
RUN mkdir -p public/uploads && chown -R nextjs:nodejs public/uploads

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "server.js"]
