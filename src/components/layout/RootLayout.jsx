import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import ContactWidget from '../tele/ContactWidget'

export default function RootLayout({ children, activeModule, onModuleChange }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-surface-bg">
      <Sidebar
        activeModule={activeModule}
        onModuleChange={onModuleChange}
        collapsed={collapsed}
      />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          activeModule={activeModule}
          onToggleSidebar={() => setCollapsed(!collapsed)}
          sidebarCollapsed={collapsed}
        />

        <main className="relative flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
          <ContactWidget />
        </main>
      </div>
    </div>
  )
}
