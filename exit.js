import { sql, init, guard, normPlate } from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!guard(req, res)) return;
  const plate = normPlate(req.body && req.body.plate);
  if (!plate) return res.status(400).json({ error: 'Plate number required' });
  const rate = Number(process.env.RATE_PER_HOUR || 3);
  try {
    await init();
    // Fee = rate x hours, rounded up, minimum 1 hour.
    const [r] = await sql`
      UPDATE parking_records
      SET exit_time = now(),
          fee = GREATEST(1, CEIL(EXTRACT(EPOCH FROM (now() - entry_time)) / 3600))::numeric * ${rate}::numeric
      WHERE plate = ${plate} AND exit_time IS NULL
      RETURNING id, plate, entry_time, exit_time, fee`;
    if (!r) return res.status(404).json({ error: plate + ' is not currently parked' });
    res.status(200).json(r);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
}
