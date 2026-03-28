import { useState, useRef, useEffect } from 'react'
import { Bell, Search, ChevronDown, LogOut, User, Settings } from 'lucide-react'
import { currentUser, notifications } from '../../data/mockData'

const moduleTitles = {
  1: 'Người dùng & Phân quyền',
  2: 'Quản trị Page',
  3: 'Hội thoại Page',
  4: 'Khách hàng & Lead',
  5: 'Quản trị Dịch vụ',
  6: 'Quản trị Kịch bản',
  7: 'Cấp số & Chia số',
  8: 'Module Tele',
  9: 'Phân quyền Chi tiết',
  10: 'Quản trị Hệ thống',
}

export default function Header({ activeModule, onToggleSidebar, sidebarCollapsed }) {
  const [showNotif, setShowNotif] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const notifRef = useRef(null)
  const userMenuRef = useRef(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false)
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 z-20">
      {/* Left: Toggle + Breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors lg:hidden"
        >
          <div className="w-5 h-4 flex flex-col justify-between">
            <span className={`block h-0.5 bg-slate-600 rounded transition-all ${sidebarCollapsed ? 'w-5' : 'w-5'}`} />
            <span className={`block h-0.5 bg-slate-600 rounded transition-all ${sidebarCollapsed ? 'w-3' : 'w-5'}`} />
            <span className={`block h-0.5 bg-slate-600 rounded transition-all ${sidebarCollapsed ? 'w-5' : 'w-5'}`} />
          </div>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">CRM</span>
          <span className="text-slate-300">/</span>
          <h1 className="text-sm font-semibold text-slate-800">{moduleTitles[activeModule]}</h1>
        </div>
      </div>

      {/* Center: Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Tìm kiếm khách hàng, lead, số điện thoại..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 border-0 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white
                       placeholder:text-slate-400 transition-all"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Notification */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Bell size={20} className="text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800">Thông báo</span>
                <span className="text-xs text-primary-600 font-medium cursor-pointer hover:underline">
                  Đánh dấu đã đọc
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${
                      !notif.read ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {!notif.read && (
                        <span className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 flex-shrink-0" />
                      )}
                      <div className={!notif.read ? '' : 'ml-5'}>
                        <p className="text-sm font-medium text-slate-800">{notif.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{notif.message}</p>
                        <p className="text-[11px] text-slate-400 mt-1">{notif.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 bg-slate-50 text-center">
                <button className="text-xs text-primary-600 font-medium hover:underline">
                  Xem tất cả thông báo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover ring-2 ring-slate-200"
            />
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-sm font-medium text-slate-800 leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[11px] text-slate-400 leading-tight">
                Nhân viên Tele
              </span>
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800">{currentUser.name}</p>
                <p className="text-xs text-slate-500">{currentUser.email}</p>
              </div>
              <div className="py-1">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                  <User size={16} className="text-slate-400" />
                  Hồ sơ cá nhân
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                  <Settings size={16} className="text-slate-400" />
                  Cài đặt
                </button>
              </div>
              <div className="border-t border-slate-100 py-1">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut size={16} />
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
