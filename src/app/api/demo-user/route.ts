import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = createAdminClient()

  // Check if demo user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const demoUser = existingUsers.users.find(
    (u) => u.email === 'demo@karigar.ai'
  )

  if (demoUser) {
    return NextResponse.json({
      message: 'Demo user already exists',
      credentials: {
        email: 'demo@karigar.ai',
        password: 'demo1234',
      },
    })
  }

  // Create demo user
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'demo@karigar.ai',
    password: 'demo1234',
    email_confirm: true,
    user_metadata: {
      full_name: 'Demo User',
      phone: '0300-1234567',
      city: 'Islamabad',
    },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    message: 'Demo user created successfully',
    credentials: {
      email: 'demo@karigar.ai',
      password: 'demo1234',
    },
    userId: data.user.id,
  })
}
