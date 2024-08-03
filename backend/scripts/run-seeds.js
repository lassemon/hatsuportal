const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('DATABASE_URL is required to run database seeds')
    process.exit(1)
  }

  const seedsDir = path.join(__dirname, '..', 'seeds')
  if (!fs.existsSync(seedsDir)) {
    console.error(`Seeds directory not found: ${seedsDir}`)
    process.exit(1)
  }

  const files = fs
    .readdirSync(seedsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort()

  if (files.length === 0) {
    console.log('No seed files to apply')
    return
  }

  const client = new Client({ connectionString: databaseUrl })
  await client.connect()

  try {
    for (const file of files) {
      const sql = fs.readFileSync(path.join(seedsDir, file), 'utf8')
      console.log(`Applying seed ${file}...`)
      await client.query(sql)
    }
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
