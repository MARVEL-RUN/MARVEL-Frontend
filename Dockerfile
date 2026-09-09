FROM node:22-alpine AS base

RUN corepack enable
RUN apk add --no-cache libc6-compat

WORKDIR /app


FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile


FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG APP_MODE=coming-soon
ARG NEXT_PUBLIC_API_BASE_URL
ARG GOOGLE_SITE_VERIFICATION
ARG NAVER_SITE_VERIFICATION
ARG GA_MEASUREMENT_ID

ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV GOOGLE_SITE_VERIFICATION=$GOOGLE_SITE_VERIFICATION
ENV NAVER_SITE_VERIFICATION=$NAVER_SITE_VERIFICATION
ENV GA_MEASUREMENT_ID=$GA_MEASUREMENT_ID

RUN case "$APP_MODE" in \
      coming-soon) pnpm run build ;; \
      main) pnpm run build:main ;; \
      *) echo "Unsupported APP_MODE=$APP_MODE"; exit 1 ;; \
    esac


FROM nginx:1.30.4-alpine AS runner

COPY frontend-nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 80
