# Build stage
FROM node:20-alpine AS build
WORKDIR /app
# copy package files (lock is optional)
COPY package*.json tsconfig.json ./
# install deps (fallback to npm install if no lockfile)
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY src src
RUN npm run build

# Run stage
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package*.json ./
# install only prod deps
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi
COPY --from=build /app/dist dist
COPY .env.example .env.example
EXPOSE 8000
CMD ["node", "dist/index.js"]
