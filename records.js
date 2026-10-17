import { sql, init, guard } from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!guard(req, res)) return;
  try {
    await init();
    const tz = process.env.TIMEZONE || 'America/Regina';
    const active = await sql`
      SELECT id, plate, entry_time FROM parking_records
      WHERE exit_time IS NULL ORDER BY entry_time DESC`;
    const history = await sql`
      SELECT id, plate, entry_time, exit_time, fee FROM parking_records
      WHERE exit_time IS NOT NULL ORDER BY exit_time DESC LIMIT 200`;
    const [s] = await sql`
      SELECT
        COUNT(*) FILTER (WHERE (entry_time AT TIME ZONE ${tz}) >= date_trunc('day', now() AT TIME ZONE ${tz})) AS today,
        COALESCE(SUM(fee), 0) AS revenue
      FROM parking_records`;
    res.status(200).json({
      active, history,
      stats: { today: Number(s.today), revenue: Number(s.revenue) },
      rate: Number(process.env.RATE_PER_HOUR || 3),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
}
