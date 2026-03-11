import pg from 'pg'
const { Pool } = pg

const pool = new Pool({
  connectionString: 'postgresql://leadflow:leadflow@localhost:5432/praxai_proxy'
})

try {
  const result = await pool.query('SELECT COUNT(*) FROM leads')
  console.log('Leads count:', result.rows[0].count)
} catch (e) {
  console.error('Error:', e.message)
} finally {
  await pool.end()
}
