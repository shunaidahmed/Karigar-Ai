'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CalendarPlus, ClipboardList, MessageSquare, User } from 'lucide-react'

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/book', icon: CalendarPlus, label: 'Book' },
  { href: '/bookings', icon: ClipboardList, label: 'Bookings' },
  { href: '/disputes', icon: MessageSquare, label: 'Disputes' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                isActive ? 'text-emerald-600' : 'text-gray-400'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs mt-0.5">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
