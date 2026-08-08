# Squinder

Monorepo with an Expo/React Native client and a Fastify realtime API.

## Stack

- Expo 56 / React Native 0.85
- Fastify 5 on Node.js 22+
- WebSocket (`/ws`) and Server-Sent Events (`/events`)
- PostgreSQL 18 with pgvector
- Drizzle ORM and postgres.js
- pnpm workspaces

## Run locally

Prepare dependencies and Docker images once:

```sh
make prep
```

After installing a development build, start Metro together with the Docker
backend:

```sh
make dev
```

To open the installed development client on the default simulator or emulator:

```sh
make ios
make android
```

Preparation and launch can also be combined, for example `make prep ios`.
Use `make down` to stop the API and database containers.

### Physical iOS and Android devices

Expo Go from the iOS App Store does not currently support SDK 56. Install the
development build on a connected device once:

```sh
cd apps/mobile
pnpm exec expo run:ios --device
# or
pnpm exec expo run:android --device
```

For subsequent sessions, run `make dev` from the repository root and open the
installed Squinder app. Cloud development builds remain available through
`make build-ios`, `make build-android`, and `make build-dev`.

The local API runs on port `3001` because port `3000` is already occupied in
the current development environment. Railway supplies its own `PORT`.

The Expo app derives the API host from the Expo development server. Override it
with `EXPO_PUBLIC_API_URL` when using a remote API.

## Endpoints

- `GET /health` — API status and version
- `GET /ws` — WebSocket ping every 5 seconds
- `GET /events` — SSE connection event and keepalive ping every 15 seconds

## Railway

Deploy the repository as an API service using the included `railway.json`.
Add Railway's dedicated **pgvector** template (the standard PostgreSQL template
does not include the extension), then reference its private `DATABASE_URL` from
the API service. The database init command is:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Set `EXPO_PUBLIC_API_URL` to the API's public Railway domain for remote builds.
For horizontal API scaling, add shared pub/sub (for example Redis) before
broadcasting WebSocket or SSE events across replicas.
