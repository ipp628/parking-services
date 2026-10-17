# Parking Tracker

Vercel + Neon Postgres. Static UI in `public/`, serverless API in `api/`.

## Deploy
1. Push this folder to a GitHub repo.
2. In Vercel: **Add New > Project**, import the repo.
3. In the project: **Storage > Create Database > Neon (Postgres)**. This sets `DATABASE_URL` for you.
4. In **Settings > Environment Variables** add:
   - `APP_PASSWORD` - password for the app (strongly recommended)
   - `RATE_PER_HOUR` - e.g. `3`
   - `TIMEZONE` - e.g. `America/Regina` (used for "visits today")
5. Redeploy. The table is created automatically on the first request (`schema.sql` is there for reference).

## Run locally
```
npm i -g vercel
npm install
cp .env.example .env.local   # fill in DATABASE_URL
vercel dev
```

## API
- `GET  /api/records` - parked cars, history, stats
- `POST /api/entry` `{ "plate": "ABC123" }`
- `POST /api/exit`  `{ "plate": "ABC123" }`
Send `x-app-password` header if `APP_PASSWORD` is set.
