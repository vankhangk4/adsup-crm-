import { useState, useMemo } from 'react'
import clsx from 'clsx'
import {
  Search,
  Filter,
  ChevronDown,
  Flame,
  Phone,
  Calendar,
  Star,
  ArrowUpDown,
  PhoneCall,
} from 'lucide-react'
import { teleLeads, services, leadStatuses } from '../../data/mockData'

// ---- Row highlighting helpers ----
function getRowHighlight(lead) {
  const now = new Date()

  if (lead.appointmentAt && new Date(lead.appointmentAt) < now) return 'overdue'
  if (lead.followUps?.some((f) => f.status === 'pending' && new Date(f.scheduledAt) < now)) return 'overdue'

  if (lead.appointmentAt) {
    const appt = new Date(lead.appointmentAt)
    if (appt.toDateString() === now.toDateString()) {
      const diffMs = appt - now
      if (diffMs <= 60 * 60 * 1000 && diffMs >= -30 * 60 * 1000) return 'due_soon'
    }
  }
  if (lead.followUps?.some((f) => {
    if (f.status === 'done') return false
    return new Date(f.scheduledAt).toDateString() === now.toDateString()
  })) return 'due_soon'

  return null
}

const rowHighlightConfig = {
  overdue: { bg: 'bg-red-50', border: 'border-l-2 border-l-red-500', dot: 'bg-red-500' },
  due_soon: { bg: 'bg-orange-50', border: 'border-l-2 border-l-orange-400', dot: 'bg-orange-400' },
}

const highlightColors = {
  'Rất cao': { text: 'text-red-600', bg: 'bg-red-50' },
  'Cao': { text: 'text-orange-600', bg: 'bg-orange-50' },
  'Trung bình': { text: 'text-amber-600', bg: 'bg-amber-50' },
  'Thấp': { text: 'text-slate-500', bg: 'bg-slate-100' },
  'Chưa đánh giá': { text: 'text-slate-400', bg: 'bg-slate-50' },
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
  const [sortField, setSortField] = useState('updatedAt')
  const [sortDir, setSortDir] = useState('desc')
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

    data.sort((a, b) => {
      let va = a[sortField]
      let vb = b[sortField]
      if (sortField === 'callCount') { va = Number(va); vb = Number(vb) }
      if (sortField === 'interestLevel') {
        const order = { 'Rất cao': 4, 'Cao': 3, 'Trung bình': 2, 'Thấp': 1, 'Chưa đánh giá': 0 }
        va = order[va] ?? 0; vb = order[vb] ?? 0
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return data
  }, [quickFilter, search, filterService, filterHot, filterStatus, sortField, sortDir])

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="text-slate-300" />
    return sortDir === 'asc'
      ? <ChevronDown size={12} className="text-primary-500 rotate-180" />
      : <ChevronDown size={12} className="text-primary-500" />
  }

  const getStatusBadge = (status) => (
    <span className="badge text-[11px] font-medium" style={{ color: status.color, backgroundColor: status.bg }}>
      {status.label}
    </span>
  )

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
  }

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="card overflow-hidden">
      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-slate-200 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Tìm theo tên, SĐT, mã lead..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={clsx('btn-secondary text-sm', showFilters && 'ring-2 ring-primary-300')}
        >
          <Filter size={15} />
          Lọc
          {(filterService !== 'all' || filterHot !== 'all' || filterStatus !== 'all') && (
            <span className="w-5 h-5 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              !
            </span>
          )}
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Dịch vụ</label>
            <select value={filterService} onChange={(e) => setFilterService(e.target.value)} className="select-field text-sm">
              <option value="all">Tất cả dịch vụ</option>
              {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Trạng thái</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="select-field text-sm">
              <option value="all">Tất cả trạng thái</option>
              {leadStatuses.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Phân loại</label>
            <select value={filterHot} onChange={(e) => setFilterHot(e.target.value)} className="select-field text-sm">
              <option value="all">Tất cả</option>
              <option value="hot">Lead nóng</option>
              <option value="cold">Lead lạnh</option>
            </select>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr>
              <th className="table-header text-left w-8">
                <button onClick={() => toggleSort('isHot')} className="flex items-center gap-1">
                  <Flame size={12} />
                  <SortIcon field="isHot" />
                </button>
              </th>
              <th className="table-header text-left">Khách hàng</th>
              <th className="table-header text-left">Dịch vụ</th>
              <th className="table-header text-left">Trạng thái</th>
              <th className="table-header text-center w-16">
                <button onClick={() => toggleSort('callCount')} className="flex items-center gap-1 mx-auto">
                  <Phone size={12} />
                  <SortIcon field="callCount" />
                </button>
              </th>
              <th className="table-header text-left">
                <button onClick={() => toggleSort('interestLevel')} className="flex items-center gap-1">
                  <Star size={12} />
                  <SortIcon field="interestLevel" />
                </button>
              </th>
              <th className="table-header text-left">
                <button onClick={() => toggleSort('appointmentAt')} className="flex items-center gap-1">
                  <Calendar size={12} />
                  <SortIcon field="appointmentAt" />
                </button>
              </th>
              <th className="table-header text-left">Cập nhật</th>
              <th className="table-header text-center w-14">Gọi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="table-cell text-center py-12 text-slate-400">
                  Không tìm thấy lead nào
                </td>
              </tr>
            ) : (
              filtered.map((lead) => {
                const ic = highlightColors[lead.interestLevel] || highlightColors['Chưa đánh giá']
                const highlight = getRowHighlight(lead)
                const hlCfg = highlight ? rowHighlightConfig[highlight] : null

                return (
                  <tr
                    key={lead.leadId}
                    onClick={() => onSelectLead(lead)}
                    className={clsx(
                      'table-row cursor-pointer transition-colors',
                      selectedLeadId === lead.leadId && 'bg-primary-50 border-l-2 border-l-primary-500',
                      hlCfg && !selectedLeadId && `${hlCfg.bg} ${hlCfg.border}`
                    )}
                  >
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        {lead.isHot && <Flame size={14} className="text-orange-500" />}
                        {hlCfg && (
                          <span title={highlight === 'overdue' ? 'Quá hạn' : 'Đến giờ'} className={clsx('w-1.5 h-1.5 rounded-full', hlCfg.dot)} />
                        )}
                      </div>
                    </td>

                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <img src={lead.customerAvatar} alt={lead.customerName} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 truncate">{lead.customerName}</p>
                          <p className="text-xs text-slate-500">{lead.customerPhone}</p>
                        </div>
                      </div>
                    </td>

                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: lead.service.color }} />
                        <span className="text-sm font-medium">{lead.service.name}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{lead.page.name}</p>
                    </td>

                    <td className="table-cell">{getStatusBadge(lead.leadStatus)}</td>

                    <td className="table-cell text-center">
                      <span className="font-medium">{lead.callCount}</span>
                      <span className="text-slate-400 text-xs ml-0.5">lần</span>
                    </td>

                    <td className="table-cell">
                      <span className={clsx('badge text-[11px] font-medium', ic.bg, ic.text)}>
                        {lead.interestLevel}
                      </span>
                    </td>

                    <td className="table-cell">
                      {lead.appointmentAt ? (
                        <span className="text-sm font-medium text-emerald-600">{formatDateTime(lead.appointmentAt)}</span>
                      ) : (
                        <span className="text-slate-400 text-sm">—</span>
                      )}
                    </td>

                    <td className="table-cell">
                      <span className="text-xs text-slate-400">{formatDate(lead.updatedAt)}</span>
                    </td>

                    <td className="table-cell text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (onCall) onCall(lead.leadId, lead.customerPhone)
                        }}
                        title={`Gọi ${lead.customerPhone}`}
                        className="w-9 h-9 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors shadow-sm hover:shadow-md active:scale-95 mx-auto"
                      >
                        <PhoneCall size={16} />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Hiển thị <span className="font-medium text-slate-700">{filtered.length}</span> / {teleLeads.length} lead
        </p>
        <div className="flex items-center gap-1">
          <button className="btn-secondary px-3 py-1.5 text-xs" disabled>Trước</button>
          <button className="btn-primary px-3 py-1.5 text-xs">1</button>
          <button className="btn-secondary px-3 py-1.5 text-xs">2</button>
          <button className="btn-secondary px-3 py-1.5 text-xs">Sau</button>
        </div>
      </div>
    </div>
  )
}
