# Збірка з кореня репозиторію: docker build -f apps/api/Dockerfile .
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
COPY apps/api/prisma apps/api/prisma
COPY apps/api/prisma.config.ts apps/api/
RUN npm ci -w api -w @barbershop/shared --include-workspace-root
COPY packages/shared packages/shared
COPY apps/api apps/api
RUN npm run build -w @barbershop/shared && npm run build -w api \
  && npm prune --omit=dev -w api -w @barbershop/shared

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production PORT=4000
COPY --from=build --chown=node:node /app/node_modules node_modules
COPY --from=build --chown=node:node /app/packages/shared/package.json packages/shared/
COPY --from=build --chown=node:node /app/packages/shared/dist packages/shared/dist
COPY --from=build --chown=node:node /app/apps/api/package.json /app/apps/api/prisma.config.ts apps/api/
COPY --from=build --chown=node:node /app/apps/api/prisma apps/api/prisma
COPY --from=build --chown=node:node /app/apps/api/dist apps/api/dist
WORKDIR /app/apps/api
USER node
EXPOSE 4000
# Міграції окремим кроком релізу зі стадії build (див. docker-compose.yml, сервіс migrate)
CMD ["node", "dist/main.js"]
