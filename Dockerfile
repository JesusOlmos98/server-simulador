# syntax=docker/dockerfile:1

############################
# Base con Yarn (Corepack) #
############################
FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare yarn@1.22.22 --activate

############################
# Deps (incluye dev)       #
############################
FROM base AS deps
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

############################
# Build (TS -> dist)       #
############################
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

################################
# Deps producción solamente     #
################################
FROM base AS prod-deps
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

############################
# Runtime ligero           #
############################
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Usuario no-root
RUN addgroup -S app && adduser -S app -G app

# Copiamos sólo lo necesario para ejecutar
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build     /app/dist        ./dist
COPY package.json ./

# Puertos del server (documentativos)
ENV TCP_PORT=8010
ENV HTTP_PORT=3000
EXPOSE 8010 3000

USER app

# Arranca aunque el build deje dist/main.js o dist/src/main.js
CMD ["node", "-e", "const fs=require('fs'); const a='./dist/main.js', b='./dist/src/main.js'; require(fs.existsSync(a)?a:b);"]
