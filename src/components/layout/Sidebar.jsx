import { useState } from 'react'
import clsx from 'clsx'
import {
  ShieldCheck,
  LayoutGrid,
  MessageSquare,
  Users,
  Briefcase,
  FileText,
  GitBranch,
  Phone,
  KeyRound,
  Settings,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { sidebarMenu, currentUser } from '../../data/mockData'

const iconMap = {
  ShieldCheck,
  LayoutGrid,
  MessageSquare,
  Users,
  Briefcase,
  FileText,
  GitBranch,
  Phone,
  KeyRound,
  Settings,
}

export default function Sidebar({ activeModule, onModuleChange, collapsed }) {
  const [expandedGroups, setExpandedGroups] = useState(['team'])

  const toggleGroup = (group) => {
    setExpandedGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    )
  }

  // Group menu by category
  const adminItems = sidebarMenu.filter((item) =>
    [currentUser.role].includes(item.role) || currentUser.role === 'super_admin' || currentUser.role === 'admin'
      ? true
      : item.roles.includes(currentUser.role)
  )

  const canAccess = (item) => {
    if (currentUser.role === 'super_admin' || currentUser.role === 'admin' || currentUser.role === 'manager') {
      return true
    }
    return item.roles.includes(currentUser.role)
  }

  return (
    <aside
      className={clsx(
        'h-full flex flex-col bg-sidebar-bg transition-all duration-300 relative z-30',
        collapsed ? 'w-[68px]' : 'w-[260px]'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">U</span>
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="text-white font-semibold text-sm leading-tight">ADS UPC</span>
            <span className="text-slate-400 text-xs">CRM System</span>
          </div>
        )}
      </div>

      {/* Scrollable nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {!collapsed ? (
          <>
            {/* Group: Công việc của tôi */}
            <div className="mb-1">
              <button
                onClick={() => toggleGroup('team')}
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-300 transition-colors"
              >
                <span>Công việc của tôi</span>
                {expandedGroups.includes('team') ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
              {expandedGroups.includes('team') && (
                <div className="mt-1 space-y-0.5">
                  {sidebarMenu
                    .filter((item) => canAccess(item) && [8].includes(item.module))
                    .map((item) => {
                      const Icon = iconMap[item.icon]
                      return (
                        <button
                          key={item.id}
                          onClick={() => onModuleChange(item.module)}
                          className={clsx('sidebar-item w-full', activeModule === item.module && 'active')}
                        >
                          {Icon && <Icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />}
                          <span className="truncate">{item.label}</span>
                          {item.module === 8 && (
                            <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                              5
                            </span>
                          )}
                        </button>
                      )
                    })}
                </div>
              )}
            </div>

            {/* Group: Quản lý */}
            {(currentUser.role === 'super_admin' ||
              currentUser.role === 'admin' ||
              currentUser.role === 'manager') && (
              <div className="mb-1">
                <button
                  onClick={() => toggleGroup('admin')}
                  className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-300 transition-colors"
                >
                  <span>Quản lý</span>
                  {expandedGroups.includes('admin') ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </button>
                {expandedGroups.includes('admin') && (
                  <div className="mt-1 space-y-0.5">
                    {sidebarMenu
                      .filter((item) => canAccess(item) && item.module !== 8)
                      .map((item) => {
                        const Icon = iconMap[item.icon]
                        return (
                          <button
                            key={item.id}
                            onClick={() => onModuleChange(item.module)}
                            className={clsx('sidebar-item w-full', activeModule === item.module && 'active')}
                          >
                            {Icon && <Icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />}
                            <span className="truncate">{item.label}</span>
                            <span className="ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">
                              M{item.module}
                            </span>
                          </button>
                        )
                      })}
                  </div>
                )}
              </div>
            )}

            {/* Simple view for tele staff */}
            {currentUser.role === 'tele_staff' && (
              <div className="space-y-0.5">
                {sidebarMenu
                  .filter((item) => canAccess(item))
                  .map((item) => {
                    const Icon = iconMap[item.icon]
                    return (
                      <button
                        key={item.id}
                        onClick={() => onModuleChange(item.module)}
                        className={clsx('sidebar-item w-full', activeModule === item.module && 'active')}
                      >
                        {Icon && <Icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />}
                        <span className="truncate">{item.label}</span>
                      </button>
                    )
                  })}
              </div>
            )}
          </>
        ) : (
          /* Collapsed — show all as icons */
          <div className="space-y-0.5">
            {sidebarMenu
              .filter((item) => canAccess(item))
              .map((item) => {
                const Icon = iconMap[item.icon]
                return (
                  <button
                    key={item.id}
                    onClick={() => onModuleChange(item.module)}
                    title={item.label}
                    className={clsx(
                      'sidebar-item w-full justify-center',
                      activeModule === item.module && 'active'
                    )}
                  >
                    {Icon && <Icon size={18} />}
                  </button>
                )
              })}
          </div>
        )}
      </nav>

      {/* Bottom user info */}
      <div className="border-t border-sidebar-border px-3 py-3">
        <div className={clsx('flex items-center gap-3', collapsed && 'justify-center')}>
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-2 ring-slate-600"
          />
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-white text-sm font-medium truncate">{currentUser.name}</span>
              <span className="text-slate-400 text-xs truncate">{currentUser.teleGroup}</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
