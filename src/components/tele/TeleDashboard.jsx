import { Users, Phone, CalendarCheck, AlertCircle, Clock } from 'lucide-react'
import { teleLeads } from '../../data/mockData'
import clsx from 'clsx'

function computeCounts() {
  const now = new Date()
  const todayStr = now.toDateString()
  return {
    all: teleLeads.length,
    new: teleLeads.filter((l) => l.leadStatusId === 'ls_01' || l.callCount === 0).length,
    dueToday: teleLeads.filter((l) => {
      if (l.appointmentAt && new Date(l.appointmentAt).toDateString() === todayStr) return true
      if (l.followUps?.some((f) => f.status !== 'done' && new Date(f.scheduledAt).toDateString() === todayStr)) return true
      return false
    }).length,
    overdue: teleLeads.filter((l) => {
      if (l.appointmentAt && new Date(l.appointmentAt) < now) return true
      if (l.followUps?.some((f) => f.status === 'pending' && new Date(f.scheduledAt) < now)) return true
      return false
    }).length,
  }
}

const counts = computeCounts()

const stats = [
  {
    id: 'all',
    label: 'Tổng Lead',
    value: teleLeads.length,
    icon: Users,
    color: '#2563EB',
    bg: '#EBF2FF',
  },
  {
    id: 'new',
    label: 'Khách mới',
    value: counts.new,
    icon: Phone,
    color: '#7C4DFF',
    bg: '#F3E8FF',
    filterKey: 'new',
  },
  {
    id: 'dueToday',
    label: 'Đến hạn',
    value: counts.dueToday,
    icon: CalendarCheck,
    color: '#00A060',
    bg: '#E8F8EF',
    filterKey: 'due_today',
  },
  {
    id: 'overdue',
    label: 'Quá hạn',
    value: counts.overdue,
    icon: AlertCircle,
    color: '#D32F2F',
    bg: '#FFEBEE',
    filterKey: 'overdue',
    alert: counts.overdue > 0,
  },
  {
    id: 'followup',
    label: 'Follow-up',
    value: teleLeads.filter((l) => l.followUps?.some((f) => f.status !== 'done')).length,
    icon: Clock,
    color: '#0097A7',
    bg: '#E0F7FA',
    filterKey: 'followup',
  },
]

export default function TeleDashboard({ onFilterClick, activeFilter }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {stats.map((stat) => {
        const Icon = stat.icon
        const isActive = activeFilter === stat.filterKey
        return (
          <div
            key={stat.id}
            onClick={() => onFilterClick && onFilterClick(stat.filterKey === undefined ? null : stat.filterKey)}
            className={clsx('tele-stat-card flex items-center gap-3 min-w-[160px] flex-shrink-0', isActive && 'active')}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: stat.bg }}
            >
              <Icon size={18} style={{ color: stat.color }} />
            </div>
            <div>
              <div className="text-xl font-bold leading-none" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-[13px] font-medium mt-0.5" style={{ color: '#65676B' }}>{stat.label}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
