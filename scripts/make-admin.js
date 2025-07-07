// Run this script to make the user an admin
const { kv } = require('@vercel/kv');

async function makeAdmin() {
  const userId = '3eb5c5f5-b2e4-4e03-a5d8-a55c3adae0b3';
  
  try {
    // Get current user data
    const user = await kv.hgetall(`user:${userId}`);
    console.log('Current user data:', user);
    
    // Update with admin flags
    const adminUser = {
      ...user,
      is_admin: true,
      subscription_tier: 'enterprise',
      sms_limit: 999999,
      stripe_customer_id: null,
      subscription_status: 'active'
    };
    
    await kv.hset(`user:${userId}`, adminUser);
    console.log('User updated to admin successfully!');
    
    // Verify the update
    const updatedUser = await kv.hgetall(`user:${userId}`);
    console.log('Updated user data:', updatedUser);
    
  } catch (error) {
    console.error('Error making user admin:', error);
  }
}

makeAdmin();