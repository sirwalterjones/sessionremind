import { kv } from '@vercel/kv'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export interface User {
  id: string
  username: string
  email: string
  subscription_tier: 'starter' | 'pro' | 'enterprise'
  subscription_status: 'active' | 'inactive' | 'cancelled' | 'pending'
  sms_usage: number
  sms_limit: number
  stripe_customer_id?: string
  is_admin?: boolean
  created_at: string
}

export interface Session {
  id: string
  user_id: string
  expires_at: string
  created_at: string
}

// Generate unique IDs
export function generateId(): string {
  return crypto.randomUUID()
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Create user
export async function createUser(username: string, email: string, password: string): Promise<User> {
  const id = generateId()
  const passwordHash = await hashPassword(password)
  
  const user: User = {
    id,
    username,
    email,
    subscription_tier: 'starter',
    subscription_status: 'pending', // New users need to pay
    sms_usage: 0,
    sms_limit: 500,
    created_at: new Date().toISOString()
  }

  // Store user
  await kv.hset(`user:${id}`, user as unknown as Record<string, unknown>)
  // Index by email for login
  await kv.set(`user:email:${email}`, id)
  // Store password hash separately
  await kv.set(`user:${id}:password`, passwordHash)

  return user
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  const userId = await kv.get(`user:email:${email}`)
  if (!userId) return null
  
  const user = await kv.hgetall(`user:${userId}`)
  return user as User | null
}

// Get user by ID
export async function getUserById(id: string): Promise<User | null> {
  const user = await kv.hgetall(`user:${id}`)
  return user as User | null
}

// Verify user credentials
export async function verifyUser(email: string, password: string): Promise<User | null> {
  const user = await getUserByEmail(email)
  if (!user) return null

  const passwordHash = await kv.get(`user:${user.id}:password`)
  if (!passwordHash) return null

  const isValid = await verifyPassword(password, passwordHash as string)
  return isValid ? user : null
}

// Create session
export async function createSession(userId: string): Promise<string> {
  const sessionId = generateId()
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  
  const session: Session = {
    id: sessionId,
    user_id: userId,
    expires_at: expiresAt.toISOString(),
    created_at: new Date().toISOString()
  }

  await kv.hset(`session:${sessionId}`, session as unknown as Record<string, unknown>)
  await kv.expireat(`session:${sessionId}`, Math.floor(expiresAt.getTime() / 1000))

  return sessionId
}

// Get session
export async function getSession(sessionId: string): Promise<Session | null> {
  const session = await kv.hgetall(`session:${sessionId}`)
  return session as Session | null
}

// Delete session
export async function deleteSession(sessionId: string): Promise<void> {
  await kv.del(`session:${sessionId}`)
}

// Get current user from request
export async function getCurrentUser(request?: NextRequest): Promise<User | null> {
  let sessionId: string | undefined

  if (request) {
    sessionId = request.cookies.get('session')?.value
  } else {
    const cookieStore = cookies()
    sessionId = cookieStore.get('session')?.value
  }

  if (!sessionId) return null

  const session = await getSession(sessionId)
  if (!session) return null

  // Check if session is expired
  if (new Date(session.expires_at) < new Date()) {
    await deleteSession(sessionId)
    return null
  }

  return getUserById(session.user_id)
}

// Set session cookie
export function setSessionCookie(sessionId: string): string {
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  return `session=${sessionId}; Path=/; HttpOnly; SameSite=Strict; Expires=${expires.toUTCString()}`
}

// Clear session cookie
export function clearSessionCookie(): string {
  return 'session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0'
}