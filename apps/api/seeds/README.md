# Persona seeds

JSON files in this folder are loaded into the `personas` table by the seed
script. The format is designed so an LLM can generate new files quickly.

## Usage

```bash
# Seed every .json file in this folder (requires a running Postgres):
pnpm --filter @squinder/api db:seed

# Seed a single file or another folder:
pnpm --filter @squinder/api db:seed apps/api/seeds/example.personas.json
```

`DATABASE_URL` defaults to `postgres://squinder:squinder@localhost:7135/squinder`
(the local Docker Postgres).

The script is idempotent: personas are upserted by `key`, so re-running a
file updates existing rows instead of duplicating them.

## File format

Either a plain array of personas or an object `{ "personas": [...] }`.

```json
{
  "personas": [
    {
      "key": "maya-barcelona",
      "name": "Maya",
      "bio": "Ceramics, city walks, and finding the best ramen in town.",
      "birthDate": "1998-04-12",
      "gender": "female",
      "interestedIn": "male",
      "smoking": "no",
      "alcohol": "socially",
      "workouts": "often",
      "pets": "want",
      "kids": "maybe",
      "country": "Spain",
      "city": "Barcelona",
      "photoUrls": ["profiles/women/1/1.png"],
      "interests": ["foodie", "yoga", "travel", "museums", "pop-music"]
    }
  ]
}
```

## Fields

| Field | Required | Values |
| --- | --- | --- |
| `key` | yes | Any stable unique string. Used for idempotent upserts. |
| `name` | yes | 2–80 characters. |
| `birthDate` | yes | `YYYY-MM-DD`, in the past. |
| `gender` | yes | `male`, `female`, `non_binary`, `prefer_not_to_say` |
| `interestedIn` | no (default `everyone`) | `male`, `female`, `everyone` |
| `smoking` | no (default `no`) | `no`, `sometimes`, `yes` |
| `alcohol` | no (default `no`) | `no`, `socially`, `regularly` |
| `workouts` | no (default `no`) | `no`, `rarely`, `often` |
| `pets` | no (default `no`) | `have`, `want`, `no`, `dont_want` |
| `kids` | no (default `no`) | `have`, `maybe`, `no`, `dont_want` |
| `bio` | no | Free text, up to 2000 characters. |
| `country` | no | Free text, up to 80 characters. |
| `city` | no | Free text, up to 80 characters. |
| `photoUrls` | no | Array of URLs or repo-relative paths like `profiles/women/1/1.png`. Relative paths are served from the local S3 bucket at `http://localhost:7133/squinder/...`. |
| `interests` | no | Up to 10 interest slugs from the shared matrix. |

All enum values and the full interest matrix live in
`packages/shared/src/` (`profile.ts` and `interests.ts`). When generating
seeds with an LLM, point it at those files for the allowed values —
unknown values make the script fail with a clear validation error before
anything is written.

Photos live in the repo-level `profiles/` folder
(`profiles/men/<n>/<i>.png`, `profiles/women/<n>/<i>.png`). On
`make backend` the folder is mirrored into the local MinIO bucket
`squinder` (public read), and clients resolve relative `photoUrls`
against it.
