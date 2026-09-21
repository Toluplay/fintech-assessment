# ---- build stage: install everything and build both packages ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY api/package.json api/
COPY web/package.json web/
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build --workspace web && npm run build --workspace api

# ---- runtime stage: production deps only, API serves the built SPA ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    SERVE_WEB=true \
    PORT=3000
COPY package.json package-lock.json ./
COPY api/package.json api/
COPY web/package.json web/
RUN npm ci --omit=dev --workspace api --no-audit --no-fund && npm cache clean --force
COPY --from=build /app/api/dist ./api/dist
COPY --from=build /app/web/dist ./web/dist
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD wget -qO- http://localhost:3000/api/health || exit 1
CMD ["node", "api/dist/main"]
