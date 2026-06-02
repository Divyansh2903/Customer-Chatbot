import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

const TITLES: Record<string, string> = {
  '/sources': 'Knowledge Sources',
  '/qa': 'Q&A Pairs',
}

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()
  const title = TITLES[pathname] ?? 'AskHive Admin'

  return (
    <div className="min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="md:ml-60 flex flex-col min-h-screen">
        <Topbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
