import { useState, useMemo } from 'react'
import clsx from 'clsx'
import {
  Search,
  Filter,
  PhoneCall,
} from 'lucide-react'
import { teleLeads, services, leadStatuses } from '../../data/mockData'

function getRowHighlight(lead) {
  const now = new Date()
  if (lead.appointmentAt && new Date(lead.appointmentAt) < now) return 'overdue'
  if (lead.followUps?.some((f) => f.status === 'pending' && new Date(f.scheduledAt) < now)) return 'overdue'
  if (lead.appointmentAt) {
    const appt = new Date(lead.appointmentAt)
    if (appt.toDateString() === now.toDateString()) {
      const diffMs = appt - now
      if (diffMs <= 60 * 60 * 1000 && diffMs >= -30 * 60 * 1000) return 'due-soon'
    }
  }
  if (lead.followUps?.some((f) => {
    if (f.status === 'done') return false
    return new Date(f.scheduledAt).toDateString() === now.toDateString()
  })) return 'due-soon'
  return null
}

const QUICK_FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'new', label: 'Khách mới' },
  { id: 'due_today', label: 'Đến hạn' },
  { id: 'overdue', label: 'Quá hạn' },
]

const interestColors = {
  'Rất cao': { text: '#D32F2F', bg: '#FFEBEE' },
  'Cao': { text: '#F57C00', bg: '#FFF3E0' },
  'Trung bình': { text: '#F9A825', bg: '#FFFDE7' },
  'Thấp': { text: '#65676B', bg: '#F0F2F5' },
  'Chưa đánh giá': { text: '#9CA3AF', bg: '#F9FAFB' },
}

export default function TeleLeadList({
  onSelectLead,
  selectedLeadId,
  filterStatus,
  setFilterStatus,
  quickFilter,
  onCall,
}) {
  const [search, setSearch] = useState('')
  const [filterService, setFilterService] = useState('all')
  const [filterHot, setFilterHot] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    let data = [...teleLeads]

    if (quickFilter && quickFilter !== 'all') {
      const now = new Date()
      const todayStr = now.toDateString()
      if (quickFilter === 'new') {
        data = data.filter((l) => l.leadStatusId === 'ls_01' || l.callCount === 0)
      } else if (quickFilter === 'due_today') {
        data = data.filter((l) => {
          if (l.appointmentAt && new Date(l.appointmentAt).toDateString() === todayStr) return true
          if (l.followUps?.some((f) => f.status !== 'done' && new Date(f.scheduledAt).toDateString() === todayStr)) return true
          return false
        })
      } else if (quickFilter === 'overdue') {
        data = data.filter((l) => {
          if (l.appointmentAt && new Date(l.appointmentAt) < now) return true
          if (l.followUps?.some((f) => f.status === 'pending' && new Date(f.scheduledAt) < now)) return true
          return false
        })
      }
    }

    if (search) {
      const q = search.toLowerCase()
      data = data.filter(
        (l) =>
          l.customerName.toLowerCase().includes(q) ||
          l.customerPhone.includes(q) ||
          l.leadId.toLowerCase().includes(q)
      )
    }

    if (filterService !== 'all') data = data.filter((l) => l.serviceId === filterService)
    if (filterHot !== 'all') data = data.filter((l) => (filterHot === 'hot') === l.isHot)
    if (filterStatus !== 'all') data = data.filter((l) => l.leadStatusId === filterStatus)

    return data
  }, [quickFilter, search, filterService, filterHot, filterStatus])

  const formatDateTime = (dateStr) => {
    if (!dateStr) return null
    const d = new Date(dateStr)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return { date: `${day}/${month}`, time: `${hours}:${minutes}` }
  }

  const isHotTag = (lead) => {
    if (lead.page?.type === 'zalo') return 'Zalo'
    if (lead.page?.type === 'facebook') return 'FB'
    return null
  }

  return (
    <div className="tele-card flex flex-col h-full">
      {/* Toolbar */}
      <div className="px-3 pt-3 pb-2">
        {/* Search Row */}
        <div className="flex items-center gap-2 mb-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B4B4B4]" size={16} />
            <input
              type="text"
              placeholder="Tìm theo tên, SĐT, mã lead..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="tele-input pl-9 py-1.5 text-[13px]"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx('tele-btn tele-btn-secondary py-1.5 px-3 text-[13px] flex-shrink-0', showFilters && 'ring-2 ring-[#2563EB]')}
          >
            <Filter size={14} />
          </button>
        </div>

        {/* Quick Filter Tabs */}
        <div className="tele-tab-bar">
          {QUICK_FILTERS.map((f) => {
            const isActive = quickFilter === f.id || (f.id === 'all' && !quickFilter)
            const count = f.id === 'all' ? teleLeads.length : filtered.length
            return (
              <button
                key={f.id}
                onClick={() => {
                  if (f.id === 'all') {
                    // handled via TeleModule
                  }
                }}
                className={clsx('tele-tab flex-1 text-[13px] justify-center', isActive && 'active')}
              >
                {f.label}
              </button>
            )
          })}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            <select
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
              className="tele-select text-[13px] py-1.5"
            >
              <option value="all">Tất cả dịch vụ</option>
              {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="tele-select text-[13px] py-1.5"
            >
              <option value="all">Tất cả trạng thái</option>
              {leadStatuses.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#65676B', backgroundColor: '#F7F8FA' }}>
                Khách hàng
              </th>
              <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#65676B', backgroundColor: '#F7F8FA' }}>
                Dịch vụ
              </th>
              <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#65676B', backgroundColor: '#F7F8FA' }}>
                Trạng thái
              </th>
              <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#65676B', backgroundColor: '#F7F8FA' }}>
                Đến hạn
              </th>
              <th className="px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-wide w-12" style={{ color: '#65676B', backgroundColor: '#F7F8FA' }}>
                Gọi
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-12 text-center text-sm" style={{ color: '#B4B4B4' }}>
                  Không tìm thấy lead nào
                </td>
              </tr>
            ) : (
              filtered.map((lead) => {
                const highlight = getRowHighlight(lead)
                const tag = isHotTag(lead)
                const appt = lead.appointmentAt ? formatDateTime(lead.appointmentAt) : null
                const ic = interestColors[lead.interestLevel] || interestColors['Chưa đánh giá']

                return (
                  <tr
                    key={lead.leadId}
                    onClick={() => onSelectLead(lead)}
                    className={clsx(
                      'tele-lead-row',
                      selectedLeadId === lead.leadId && 'selected',
                      highlight === 'overdue' && 'overdue',
                      highlight === 'due-soon' && 'due-soon'
                    )}
                  >
                    {/* Customer */}
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={lead.customerAvatar}
                          alt={lead.customerName}
                          className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[13px] font-semibold" style={{ color: '#1C1E21' }}>
                              {lead.customerName}
                            </span>
                            {lead.isHot && (
                              <span className="tele-badge-red text-[10px] px-1 py-0">Nóng</span>
                            )}
                          </div>
                          <div className="text-[12px] mt-0.5" style={{ color: '#65676B' }}>
                            {lead.customerPhone}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Service */}
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: lead.service.color }}
                        />
                        <span className="text-[13px] font-medium" style={{ color: '#1C1E21' }}>
                          {lead.service.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ backgroundColor: '#F0F2F5', color: '#65676B' }}>
                          {lead.page.name}
                        </span>
                        {tag && (
                          <span className="tele-badge-blue text-[10px]">{tag}</span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-3 py-2.5">
                      <span
                        className="tele-badge text-[11px]"
                        style={{ color: lead.leadStatus.color, backgroundColor: lead.leadStatus.bg }}
                      >
                        {lead.leadStatus.label}
                      </span>
                      <div className="mt-1 text-[11px]" style={{ color: '#65676B' }}>
                        {lead.callCount > 0 ? `${lead.callCount} cuộc gọi` : 'Chưa gọi'}
                      </div>
                    </td>

                    {/* Appointment */}
                    <td className="px-3 py-2.5">
                      {appt ? (
                        <div>
                          <div className="text-[13px] font-semibold" style={{ color: '#00A060' }}>
                            {appt.date}
                          </div>
                          <div className="text-[12px]" style={{ color: '#65676B' }}>
                            {appt.time}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[12px]" style={{ color: '#B4B4B4' }}>—</span>
                      )}
                    </td>

                    {/* Call Button */}
                    <td className="px-3 py-2.5 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (onCall) onCall(lead.leadId, lead.customerPhone)
                        }}
                        title={`Gọi ${lead.customerPhone}`}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                        style={{ backgroundColor: '#00A060' }}
                      >
                        <PhoneCall size={14} color="#fff" />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-3 py-2 flex items-center justify-between" style={{ borderTop: '1px solid #F0F2F5' }}>
        <span className="text-[12px]" style={{ color: '#65676B' }}>
          Hiển thị <strong>{filtered.length}</strong> / {teleLeads.length} lead
        </span>
        <div className="flex items-center gap-1">
          <button className="tele-btn tele-btn-secondary py-1 px-2 text-[12px]" style={{ minWidth: 'auto' }}>
            ‹
          </button>
          <button className="tele-btn tele-btn-primary py-1 px-2.5 text-[12px]" style={{ minWidth: 'auto' }}>
            1
          </button>
          <button className="tele-btn tele-btn-secondary py-1 px-2.5 text-[12px]" style={{ minWidth: 'auto' }}>
            2
          </button>
          <button className="tele-btn tele-btn-secondary py-1 px-2 text-[12px]" style={{ minWidth: 'auto' }}>
            ›
          </button>
        </div>
      </div>
    </div>
  )
}
