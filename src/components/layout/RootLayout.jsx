import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import ContactWidget from '../tele/ContactWidget'

export default function RootLayout({ children, activeModule, onModuleChange }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:relative inset-y-0 left-0 z-50 h-full w-[260px] flex-shrink-0
          transform transition-transform duration-300 ease-in-out
          lg:transform-none lg:flex-shrink-0
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <Sidebar
          activeModule={activeModule}
          onModuleChange={(mod) => {
            onModuleChange(mod)
            setMobileMenuOpen(false)
          }}
          collapsed={collapsed}
        />
      </div>

      {/* Main content area — this is the scrollable container */}
      <div className="flex flex-col flex-1 min-w-0 h-screen">
        <Header
          activeModule={activeModule}
          onToggleSidebar={() => setMobileMenuOpen(!mobileMenuOpen)}
          sidebarCollapsed={collapsed}
        />

        <main className="relative flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
          {children}
          <ContactWidget />
        </main>
      </div>
    </div>
  )
}
