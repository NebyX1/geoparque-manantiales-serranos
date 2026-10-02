FROM node:22.22.3-alpine3.23 AS build

WORKDIR /app

ARG SITE_URL=""
ARG SITE_INDEXABLE="false"
ENV SITE_URL=${SITE_URL}
ENV SITE_INDEXABLE=${SITE_INDEXABLE}

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.29.4-alpine3.23 AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/health || exit 1
