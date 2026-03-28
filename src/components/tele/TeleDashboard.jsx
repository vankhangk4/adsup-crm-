import { Phone, Users, CalendarCheck, TrendingUp, AlertCircle, Clock } from 'lucide-react'
import { teleStats } from '../../data/mockData'

const stats = [
  {
    id: 'total',
    label: 'Tổng Lead',
    value: teleStats.totalLeads,
    icon: Users,
    color: '#3b82f6',
    bg: '#eff6ff',
    sub: `Đang chờ: ${teleStats.pendingLeads}`,
  },
  {
    id: 'called',
    label: 'Đã gọi hôm nay',
    value: teleStats.calledToday,
    icon: Phone,
    color: '#8b5cf6',
    bg: '#f5f3ff',
    sub: 'Cuộc gọi',
  },
  {
    id: 'booked',
    label: 'Đặt lịch hôm nay',
    value: teleStats.bookedToday,
    icon: CalendarCheck,
    color: '#10b981',
    bg: '#ecfdf5',
    sub: `Tháng: ${teleStats.bookedMonth} lịch`,
  },
  {
    id: 'revenue',
    label: 'Doanh thu tháng',
    value: `${(teleStats.revenueMonth / 1000000).toFixed(1)}M`,
    icon: TrendingUp,
    color: '#f59e0b',
    bg: '#fffbeb',
    sub: 'VNĐ',
  },
  {
    id: 'followup',
    label: 'Follow-up hôm nay',
    value: teleStats.followUpToday,
    icon: Clock,
    color: '#06b6d4',
    bg: '#ecfeff',
    sub: teleStats.followUpOverdue > 0 ? `Quá hạn: ${teleStats.followUpOverdue}` : 'Tất cả đúng hạn',
    alert: teleStats.followUpOverdue > 0,
  },
]

export default function TeleDashboard() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div key={stat.id} className="card p-4">
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: stat.bg }}
              >
                <Icon size={20} style={{ color: stat.color }} />
              </div>
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
