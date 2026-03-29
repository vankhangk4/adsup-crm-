/**
 * Sidebar - Menu trái màu tối (#1E293B)
 * Chứa: Logo, các nhóm menu có icon, badge notification, collapsible
 */
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GitBranch,
  Box,
  MessageSquare,
  Building2,
  UserCog,
  Shield,
  ChevronDown,
  ChevronRight,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { sidebarMenu } from '../../data/mockData';

const ICON_MAP = {
  LayoutDashboard,
  Users,
  GitBranch,
  Box,
  MessageSquare,
  Building2,
  UserCog,
  Shield,
};

export default function Sidebar({ isMobileOpen, onMobileClose }) {
  const [expandedGroups, setExpandedGroups] = useState(
    sidebarMenu.reduce((acc, g) => ({ ...acc, [g.group]: true }), {})
  );
  const location = useLocation();

  const toggleGroup = (group) => {
    setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const handleNavClick = () => {
    if (isMobileOpen) onMobileClose?.();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-[#1E293B] z-50
          flex flex-col transition-transform duration-300
          lg:translate-x-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-tight">FPT CRM</h1>
            <p className="text-white/50 text-[10px]">Hệ thống quản lý</p>
          </div>
          <button
            onClick={onMobileClose}
            className="ml-auto lg:hidden text-white/60 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search in sidebar */}
        <div className="px-4 py-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full bg-white/10 text-white/80 placeholder-white/40 text-sm px-3 py-2 pl-9 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
            <svg
              className="absolute left-2.5 top-2.5 text-white/40"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin">
          {sidebarMenu.map((group) => (
            <div key={group.group} className="mb-4">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.group)}
                className="flex items-center gap-2 w-full px-2 py-1.5 text-white/40 text-[11px] font-semibold uppercase tracking-wider hover:text-white/60 transition-colors"
              >
                <span className="flex-1 text-left">{group.group}</span>
                {expandedGroups[group.group] ? (
                  <ChevronDown size={12} />
                ) : (
                  <ChevronRight size={12} />
                )}
              </button>

              {/* Group Items */}
              {expandedGroups[group.group] && (
                <div className="mt-1 space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = ICON_MAP[item.icon];
                    const isActive = location.pathname === item.path;

                    return (
                      <NavLink
                        key={item.id}
                        to={item.path}
                        onClick={handleNavClick}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                          transition-all duration-150 group relative
                          ${
                            isActive
                              ? 'bg-blue-500/20 text-blue-400 border-l-2 border-blue-400 ml-[-2px]'
                              : 'text-white/70 hover:bg-white/10 hover:text-white'
                          }
                        `}
                      >
                        {Icon && <Icon size={18} className="flex-shrink-0" />}
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-white/10 px-3 py-3 space-y-1">
          <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-white/50 hover:bg-white/10 hover:text-white text-sm transition-colors">
            <Settings size={18} />
            <span>Cài đặt</span>
          </button>
          <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-white/50 hover:bg-white/10 hover:text-white text-sm transition-colors">
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>

          {/* Admin User */}
          <div className="flex items-center gap-3 px-3 py-2.5 mt-2 rounded-lg bg-white/5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">AD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">Admin</p>
              <p className="text-white/40 text-xs truncate">admin@fpt.vn</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
