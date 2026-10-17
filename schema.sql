-- Optional: the API creates this automatically on first request.
CREATE TABLE IF NOT EXISTS parking_records (
  id         BIGSERIAL PRIMARY KEY,
  plate      TEXT NOT NULL,
  entry_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  exit_time  TIMESTAMPTZ,
  fee        NUMERIC(10,2)
);
-- A plate can only have one open (not yet exited) visit.
CREATE UNIQUE INDEX IF NOT EXISTS one_open_per_plate
  ON parking_records (plate) WHERE exit_time IS NULL;
CREATE INDEX IF NOT EXISTS idx_entry_time ON parking_records (entry_time DESC);
