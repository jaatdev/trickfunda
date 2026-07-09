'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FileText, Settings, BarChart3, Users } from 'lucide-react'

export function AdminSidebar() {
  const pathname = usePathname()

  const links = [
    { href: '/admin', label: 'Dashboard', icon: Home },
    { href: '/admin/content', label: 'Content', icon: FileText },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h2>
      </div>
      <nav className="px-3">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{link.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
