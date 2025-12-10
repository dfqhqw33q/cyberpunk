import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getSupabaseServiceClient } from '@/lib/supabase/server'
import { validatePasswordStrength } from '@/lib/validation'
import { headers } from 'next/headers'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get current user to check permissions
    const supabase = getSupabaseServiceClient()
    const { data: currentUser, error: userError } = await supabase
      .from('app_users')
      .select('restrictions')
      .eq('id', session.userId)
      .single()

    if (userError || !currentUser) {
      return NextResponse.json(
        { success: false, error: 'Failed to verify permissions' },
        { status: 500 }
      )
    }

    // Check if user has permission to add users
    if (!currentUser.restrictions.can_add_users) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to add users' },
        { status: 403 }
      )
    }

    const { username, password, restrictions } = await request.json()

    // Validation
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      )
    }

    if (username.length < 3) {
      return NextResponse.json(
        { success: false, error: 'Username must be at least 3 characters' },
        { status: 400 }
      )
    }

    // Check password strength
    const passwordStrength = validatePasswordStrength(password)
    if (!passwordStrength.score || passwordStrength.score < 2) {
      return NextResponse.json(
        { success: false, error: 'Password is too weak. Please use a stronger password.' },
        { status: 400 }
      )
    }

    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('app_users')
      .select('id')
      .eq('username', username)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Username already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex')

    // Calculate password expiry (90 days from now)
    const passwordExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)

    // Create user
    const { data: newUser, error: createError } = await supabase
      .from('app_users')
      .insert({
        username,
        password_hash: passwordHash,
        user_level: 'regular', // Regular users can only add other regular users
        restrictions: restrictions || {
          can_add_users: false,
          can_edit_users: false,
          can_view_logs: false,
          can_manage_roles: false,
        },
        is_active: true,
        is_locked: false,
        failed_attempts: 0,
        password_expires_at: passwordExpiresAt.toISOString(),
      })
      .select('id')
      .single()

    if (createError || !newUser) {
      console.error('Error creating user:', createError)
      return NextResponse.json(
        { success: false, error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Log the action
    const headersList = await headers()
    const ipAddress = headersList.get('x-forwarded-for') || 'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'

    await supabase.from('audit_logs').insert({
      user_id: session.userId,
      action: 'ADD_USER',
      target_user_id: newUser.id,
      ip_address: ipAddress,
      user_agent: userAgent,
      details: `User created by ${session.username}`,
    })

    return NextResponse.json({
      success: true,
      userId: newUser.id,
    })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
