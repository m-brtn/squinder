# Squinder CRM

Internal web app for managing swipe personas. No authentication yet — it is
a local admin tool.

## Features

- List, search, create, edit, and delete personas.
- Full profile form: name, bio, birth date, gender, interested in, smoking,
  alcohol, workouts, pets, kids, country, city, photos.
- Interest picker backed by the shared interest matrix
  (`@squinder/shared`), same slugs as the mobile onboarding.

## Running

The API must be reachable (default `http://localhost:7131`, i.e.
`make backend`).

```bash
pnpm dev:crm            # from the repo root
# or
pnpm --filter @squinder/crm dev
```

Set `VITE_API_URL` to point at a different API instance and
`VITE_MEDIA_URL` at a different S3 bucket (defaults to the local MinIO
bucket `http://localhost:7133/squinder`).

## Seeding data

See `apps/api/seeds/README.md` for the LLM-friendly JSON seed format and
`pnpm --filter @squinder/api db:seed`.
