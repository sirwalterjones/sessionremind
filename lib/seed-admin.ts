import { kv } from '@vercel/kv'
import { createUser } from './auth'

export async function seedAdminUser() {
  const adminEmail = 'walterjonesjr@gmail.com'
  
  // Check if admin already exists
  const existingAdmin = await kv.get(`user:email:${adminEmail}`)
  if (existingAdmin) {
    console.log('Admin user already exists')
    return
  }

  // Create admin user
  const adminUser = await createUser(
    'walterjones', 
    adminEmail, 
    'candice' // Admin password
  )

  // Set admin flags
  await kv.hset(`user:${adminUser.id}`, {
    ...adminUser,
    is_admin: true,
    subscription_tier: 'enterprise',
    sms_limit: 999999, // Unlimited for admin
    stripe_customer_id: null, // No payment required for admin
    subscription_status: 'active' // Always active for admin
  } as unknown as Record<string, unknown>)

  console.log('Admin user created:', adminUser.id)
  return adminUser
}

// Function to migrate existing data to admin user
export async function migrateExistingDataToAdmin() {
  const adminEmail = 'walterjonesjr@gmail.com'
  const adminUserId = await kv.get(`user:email:${adminEmail}`)
  
  if (!adminUserId) {
    console.error('Admin user not found')
    return
  }

  // Note: Since you were using localStorage before, 
  // the existing dashboard data will automatically show up
  // for the admin user when they log in and use the same browser
  
  console.log('Data migration setup complete for admin user:', adminUserId)
  return adminUserId
}