import { Phone, Users, CalendarCheck, TrendingUp, AlertCircle, Clock, ArrowRight } from 'lucide-react'
import { teleStats } from '../../data/mockData'
import clsx from 'clsx'

// Derived quick-filter counts — computed from teleLeads
import { teleLeads } from '../../data/mockData'

function computeCounts() {
  const now = new Date()
  const todayStr = now.toDateString()

  const newLeads = teleLeads.filter((l) => l.leadStatusId === 'ls_01' || l.callCount === 0).length
  const dueToday = teleLeads.filter((l) => {
    if (!l.appointmentAt) return false
    const d = new Date(l.appointmentAt)
    return d.toDateString() === todayStr
  }).length
  const overdue = teleLeads.filter((l) => {
    if (!l.appointmentAt) return false
    return new Date(l.appointmentAt) < now
  }).length
  const followupToday = teleLeads.filter((l) => {
    if (!l.followUps?.length) return false
    return l.followUps.some((f) => {
      if (f.status === 'done') return false
      const d = new Date(f.scheduledAt)
      return d.toDateString() === todayStr
    })
  }).length

  return { newLeads, dueToday, overdue, followupToday }
}

const counts = computeCounts()

const stats = [
  {
    id: 'all',
    label: 'Tất cả Lead',
    value: teleStats.totalLeads,
    icon: Users,
    color: '#3b82f6',
    bg: '#eff6ff',
    sub: `Đang chờ: ${teleStats.pendingLeads}`,
    filterKey: null,
  },
  {
    id: 'new',
    label: 'Khách mới',
    value: counts.newLeads,
    icon: Phone,
    color: '#8b5cf6',
    bg: '#f5f3ff',
    sub: 'Cần gọi ngay',
    filterKey: 'new',
  },
  {
    id: 'dueToday',
    label: 'Đến hạn hôm nay',
    value: counts.dueToday,
    icon: CalendarCheck,
    color: '#10b981',
    bg: '#ecfdf5',
    sub: 'Cần chăm sóc',
    filterKey: 'due_today',
  },
  {
    id: 'overdue',
    label: 'Quá hạn',
    value: counts.overdue,
    icon: AlertCircle,
    color: '#ef4444',
    bg: '#fef2f2',
    sub: counts.overdue > 0 ? 'Cần xử lý ngay' : 'Không có',
    filterKey: 'overdue',
    alert: counts.overdue > 0,
  },
  {
    id: 'followup',
    label: 'Follow-up',
    value: teleStats.followUpToday,
    icon: Clock,
    color: '#06b6d4',
    bg: '#ecfeff',
    sub: teleStats.followUpOverdue > 0 ? `Quá hạn: ${teleStats.followUpOverdue}` : 'Tất cả đúng hạn',
    filterKey: 'followup',
    alert: teleStats.followUpOverdue > 0,
  },
]

export default function TeleDashboard({ onFilterClick, activeFilter }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        const isActive = activeFilter === stat.filterKey
        return (
          <div
            key={stat.id}
            onClick={() => onFilterClick && onFilterClick(stat.filterKey)}
            className={clsx(
              'card p-4 transition-all duration-150',
              stat.filterKey !== null
                ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5'
                : '',
              isActive && stat.filterKey !== null
                ? 'ring-2 ring-offset-1'
                : ''
            )}
            style={isActive && stat.filterKey !== null ? { ringColor: stat.color } : {}}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: stat.bg }}
              >
                <Icon size={20} style={{ color: stat.color }} />
              </div>
              {stat.filterKey !== null && (
                <ArrowRight
                  size={14}
                  className={clsx(
                    'transition-all',
                    isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1'
                  )}
                  style={{ color: stat.color }}
                />
              )}
            </div>
            <div className="flex flex-wrap items-baseline gap-1 mb-1">
              <span className="text-2xl font-bold text-slate-800">{stat.value}</span>
              <span className="text-sm text-slate-500">{stat.sub}</span>
            </div>
            <p className="text-xs text-slate-500">{stat.label}</p>
            {stat.alert && (
              <div className="flex items-center gap-1 mt-2 text-red-600">
                <AlertCircle size={12} />
                <span className="text-xs font-medium">Cần xử lý ngay</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
