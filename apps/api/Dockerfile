FROM node:22-alpine AS build

RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
# The full shared package is needed before install: its prepare script
# builds dist during pnpm install.
COPY packages/shared packages/shared
RUN pnpm install --frozen-lockfile --filter @squinder/api...

COPY apps/api apps/api
RUN pnpm --filter @squinder/api build

FROM node:22-alpine AS runtime

ENV NODE_ENV=production
RUN corepack enable
WORKDIR /app

COPY --from=build /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/drizzle ./apps/api/drizzle
COPY --from=build /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=build /app/packages/shared/dist ./packages/shared/dist

EXPOSE 3000

CMD ["pnpm", "--filter", "@squinder/api", "start"]
