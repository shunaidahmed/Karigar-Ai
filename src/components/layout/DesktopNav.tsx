'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { Home, CalendarPlus, ClipboardList, MessageSquare, User, Wrench } from 'lucide-react'

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/book', icon: CalendarPlus, label: 'Book Service' },
  { href: '/bookings', icon: ClipboardList, label: 'Bookings' },
  { href: '/disputes', icon: MessageSquare, label: 'Disputes' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export function DesktopNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
            <Wrench size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-emerald-600">Karigar.ai</h1>
            <p className="text-xs text-gray-500">Har Karigar, Ek Click Dur</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User info */}
      {user && (
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
              <User size={16} className="text-emerald-600" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-900 truncate">
                {user.user_metadata?.full_name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
