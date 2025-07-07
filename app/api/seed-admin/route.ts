import { NextResponse } from 'next/server'
import { seedAdminUser, migrateExistingDataToAdmin } from '@/lib/seed-admin'

export async function POST() {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'This endpoint is only available in development' },
        { status: 403 }
      )
    }

    const adminUser = await seedAdminUser()
    await migrateExistingDataToAdmin()

    return NextResponse.json({
      success: true,
      message: 'Admin user seeded successfully',
      adminUser: adminUser ? {
        id: adminUser.id,
        email: adminUser.email,
        username: adminUser.username
      } : 'Already exists'
    })

  } catch (error) {
    console.error('Admin seeding error:', error)
    return NextResponse.json(
      { error: 'Failed to seed admin user' },
      { status: 500 }
    )
  }
}