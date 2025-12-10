import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getSupabaseServiceClient } from '@/lib/supabase/server'

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

    // Check if user has permission to view logs
    if (!currentUser.restrictions.can_view_logs) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to view logs' },
        { status: 403 }
      )
    }

    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '100', 10)

    // Fetch logs - limit to the last 100 for regular users
    const { data: logs, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch logs' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      logs: logs || [],
    })
  } catch (error) {
    console.error('Error fetching logs:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
