import { sql, init, guard, normPlate } from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!guard(req, res)) return;
  const plate = normPlate(req.body && req.body.plate);
  if (!plate) return res.status(400).json({ error: 'Plate number required' });
  try {
    await init();
    const [r] = await sql`
      INSERT INTO parking_records (plate) VALUES (${plate})
      RETURNING id, plate, entry_time`;
    res.status(201).json(r);
  } catch (e) {
    if (e && e.code === '23505') return res.status(409).json({ error: plate + ' is already parked' });
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
}
