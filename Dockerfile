# ---------- deps
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# ---------- builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* được inline vào bundle lúc build -> phải truyền qua build args, không phải env runtime
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_SHIPPING_FEE
ARG NEXT_PUBLIC_VIETQR_BANK_ID
ARG NEXT_PUBLIC_VIETQR_ACCOUNT_NO
ARG NEXT_PUBLIC_VIETQR_ACCOUNT_NAME
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---------- runtime
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3001 HOSTNAME=0.0.0.0
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3001
CMD ["node","server.js"]
