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
# API_URL chỉ dùng phía server; truyền ở build nếu có trang cần fetch lúc build và luôn
# cấu hình lại dưới dạng runtime env khi chạy container.
ARG API_URL
ENV API_URL=$API_URL
ARG NEXT_PUBLIC_SITE_URL
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
