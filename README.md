# Squinder

Monorepo with an Expo/React Native client and a Fastify realtime API.

## Stack

- Expo 57 / React Native 0.86
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

Then start the desired Expo target together with the Docker backend:

```sh
make web
make ios
make android
```

Preparation and launch can also be combined, for example `make prep web`.
Use `make down` to stop the API and database containers.

### Physical iOS and Android devices

SDK 57 requires a development client until its Expo Go build reaches the app
stores. Sign in to EAS and create installable clients once:

```sh
pnpm exec eas login
make build-dev
```

Install each build from the QR code or link printed by EAS. After that,
`make ios` and `make android` start Metro in dev-client mode. Open the installed
Squinder development client and scan the Metro QR code.

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
