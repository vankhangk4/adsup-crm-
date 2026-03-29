/**
 * Header - Top bar màu trắng
 * Chứa: Mobile menu toggle, page title, search, notifications, avatar
 */
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, ChevronDown, Menu, Search } from 'lucide-react';
import SearchInput from '../common/SearchInput';

const PAGE_TITLES = {
  '/': 'Bảng điều khiển',
  '/leads': 'Quản lý Lead',
  '/routing': 'Routing',
  '/services': 'Dịch vụ',
  '/chat': 'Chat đa kênh',
  '/departments': 'Phòng ban',
  '/users': 'Quản trị người dùng',
  '/permissions': 'Phân quyền',
};

export default function Header({ onMobileMenuToggle }) {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const pageTitle = PAGE_TITLES[location.pathname] || 'CRM';

  const notifications = [
    { id: 1, text: 'Có 5 Lead mới chưa được phân công', time: '5 phút trước', unread: true },
    { id: 2, text: 'Lê Minh Tuấn vừa cập nhật trạng thái Lead #128', time: '15 phút trước', unread: true },
    { id: 3, text: 'Báo cáo tuần 12 đã sẵn sàng', time: '1 giờ trước', unread: false },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3">
        {/* Left: Mobile menu + Page Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{pageTitle}</h1>
            <p className="text-xs text-gray-400 hidden sm:block">
              Chào buổi sáng, Admin
            </p>
          </div>
        </div>

        {/* Center: Search (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <SearchInput
            placeholder="Tìm kiếm Lead, khách hàng..."
            size="sm"
          />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Search icon mobile */}
          <button className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Search size={20} />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800">Thông báo</h3>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${
                          n.unread ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <p className="text-sm text-gray-800 leading-snug">{n.text}</p>
                        <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2.5 text-center border-t border-gray-100">
                    <button className="text-sm text-blue-500 hover:text-blue-600 font-medium">
                      Xem tất cả thông báo
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Avatar */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">AD</span>
              </div>
              <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-semibold text-gray-800">Admin</p>
                    <p className="text-xs text-gray-400">admin@fpt.vn</p>
                  </div>
                  <div className="py-1">
                    {['Hồ sơ cá nhân', 'Cài đặt', 'Đăng xuất'].map((item) => (
                      <button
                        key={item}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
