import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getSupabaseServiceClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function GET(request: Request) {
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

    // Check if user has permission to edit users
    if (!currentUser.restrictions.can_edit_users) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to edit users' },
        { status: 403 }
      )
    }

    // Fetch all users
    const { data: users, error } = await supabase
      .from('app_users')
      .select('id, username, user_level, is_active, is_locked, restrictions')
      .order('username', { ascending: true })

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      users: users || [],
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
