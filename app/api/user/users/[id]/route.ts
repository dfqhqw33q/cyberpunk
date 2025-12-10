import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getSupabaseServiceClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params
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

    const { is_active, restrictions } = await request.json()

    // Validate restrictions object
    if (restrictions && typeof restrictions !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid restrictions format' },
        { status: 400 }
      )
    }

    // Update user
    const { data: updatedUser, error: updateError } = await supabase
      .from('app_users')
      .update({
        is_active: is_active !== undefined ? is_active : undefined,
        restrictions: restrictions || undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()

    if (updateError || !updatedUser) {
      console.error('Error updating user:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update user' },
        { status: 500 }
      )
    }

    // Log the action
    const headersList = await headers()
    const ipAddress = headersList.get('x-forwarded-for') || 'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'

    await supabase.from('audit_logs').insert({
      user_id: session.userId,
      action: 'EDIT_USER',
      target_user_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent,
      details: `User edited by ${session.username}`,
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
