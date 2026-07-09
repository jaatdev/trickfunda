import { ReactNode } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export const metadata = {
  title: 'Admin - TrickFunda',
}

export default function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 pt-16 md:pt-20">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
