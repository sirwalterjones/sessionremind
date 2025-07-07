const { seedAdminUser, migrateExistingDataToAdmin } = require('../lib/seed-admin.ts')

async function runSeed() {
  try {
    console.log('Starting admin user seeding...')
    await seedAdminUser()
    await migrateExistingDataToAdmin()
    console.log('Admin user seeding completed successfully!')
  } catch (error) {
    console.error('Error seeding admin user:', error)
  }
}

runSeed()