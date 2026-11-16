FROM node:22.22.3-alpine3.23 AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
COPY scripts/check-knowledge.mjs ./scripts/check-knowledge.mjs
COPY data/knowledge.json ./data/knowledge.json
RUN npm run build

FROM node:22.22.3-alpine3.23 AS runtime

WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=4319
COPY package.json ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/data/knowledge.json ./data/knowledge.json
USER node

EXPOSE 4319
HEALTHCHECK --interval=30s --timeout=4s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null "http://127.0.0.1:${PORT}/api/ready" || exit 1
CMD ["node", "dist/index.js"]
