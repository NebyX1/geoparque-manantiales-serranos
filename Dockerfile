FROM node:22.22.3-alpine3.23 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

ARG SITE_URL=""
ARG SITE_INDEXABLE="false"
ARG PUBLIC_SERRANA_API_BASE=""
ENV SITE_URL=${SITE_URL}
ENV SITE_INDEXABLE=${SITE_INDEXABLE}
ENV PUBLIC_SERRANA_API_BASE=${PUBLIC_SERRANA_API_BASE}

COPY . .
RUN npm run build \
  && sed "s|__SERRANA_API_ORIGIN__|${PUBLIC_SERRANA_API_BASE}|" nginx.conf > /tmp/default.conf.template

FROM nginxinc/nginx-unprivileged:1.29.4-alpine3.23 AS runtime

ENV SERRANA_BACKEND_URL=http://127.0.0.1:4319
ENV NGINX_ENVSUBST_FILTER="^SERRANA_BACKEND_URL$"
COPY --from=build /tmp/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/health || exit 1
