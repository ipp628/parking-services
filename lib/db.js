import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.DATABASE_URL);

let ready;
export function init() {
  if (!ready) {
    ready = (async () => {
      await sql`CREATE TABLE IF NOT EXISTS parking_records (
        id BIGSERIAL PRIMARY KEY,
        plate TEXT NOT NULL,
        entry_time TIMESTAMPTZ NOT NULL DEFAULT now(),
        exit_time TIMESTAMPTZ,
        fee NUMERIC(10,2)
      )`;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS one_open_per_plate
        ON parking_records (plate) WHERE exit_time IS NULL`;
      await sql`CREATE INDEX IF NOT EXISTS idx_entry_time
        ON parking_records (entry_time DESC)`;
    })().catch((e) => { ready = null; throw e; });
  }
  return ready;
}

// If APP_PASSWORD is set, every request must send it in x-app-password.
export function guard(req, res) {
  const pw = process.env.APP_PASSWORD;
  if (pw && req.headers['x-app-password'] !== pw) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

export const normPlate = (s) =>
  String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
