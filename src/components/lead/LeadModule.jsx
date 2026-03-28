import { useState, useMemo } from 'react'
import clsx from 'clsx'
import {
  Search,
  Filter,
  X,
  Flame,
  Phone,
  Calendar,
  Star,
  Clock,
  DollarSign,
  ChevronRight,
  Plus,
  ArrowUpDown,
  LayoutGrid,
  Table2,
  User,
  MapPin,
  Tag,
  Activity,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react'
import {
  leads,
  customers,
  leadSources,
  leadStatuses,
  services,
  funnelStats,
} from '../../data/mockData'

// ---- Helpers ----
const formatCurrency = (n) => {
  if (!n) return '—'
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ'
}

const formatDate = (str) => {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

const formatDateTime = (str) => {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const interestColors = {
  'Rất cao': { text: 'text-red-600', bg: 'bg-red-50' },
  'Cao': { text: 'text-orange-600', bg: 'bg-orange-50' },
  'Trung bình': { text: 'text-amber-600', bg: 'bg-amber-50' },
  'Thấp': { text: 'text-slate-500', bg: 'bg-slate-100' },
  'Chưa đánh giá': { text: 'text-slate-400', bg: 'bg-slate-50' },
}

const interestOrder = { 'Rất cao': 4, 'Cao': 3, 'Trung bình': 2, 'Thấp': 1, 'Chưa đánh giá': 0 }

// Funnel stage statuses (simplified)
const funnelStages = [
  { statusId: 'ls_01', label: 'Mới', color: '#3b82f6' },
  { statusId: 'ls_02', label: 'Đã gọi', color: '#8b5cf6' },
  { statusId: 'ls_04', label: 'Hẹn lịch', color: '#f59e0b' },
  { statusId: 'ls_05', label: 'Đặt cọc', color: '#10b981' },
  { statusId: 'ls_06', label: 'Đã khám', color: '#06b6d4' },
  { statusId: 'ls_07', label: 'Chốt đơn', color: '#059669' },
]

// ---- Duplicate Detection ----
function DuplicatePanel({ lead, onClose }) {
  const phone = lead.customerPhone.replace(/\./g, '')
  const name = lead.customerName.toLowerCase()

  const duplicates = leads.filter((l) => {
    if (l.leadId === lead.leadId) return false
    const samePhone = l.customerPhone.replace(/\./g, '').includes(phone) || phone.includes(l.customerPhone.replace(/\./g, ''))
    const sameName = l.customerName.toLowerCase().includes(name) || name.includes(l.customerName.toLowerCase())
    return samePhone || sameName
  })

  if (duplicates.length === 0) return null

  return (
    <div className="card border-l-4 border-l-amber-400">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-500" />
          <h3 className="font-semibold text-slate-800 text-sm">Phát hiện trùng lặp ({duplicates.length})</h3>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X size={16} />
        </button>
      </div>
      <div className="divide-y divide-slate-100">
        {duplicates.map((d) => (
          <div key={d.leadId} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50">
            <div className="flex items-center gap-3">
              <img src={d.customerAvatar} alt={d.customerName} className="w-8 h-8 rounded-full object-cover" />
              <div>
                <p className="text-sm font-medium text-slate-800">{d.customerName}</p>
                <p className="text-xs text-slate-500">{d.customerPhone}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">{d.serviceName}</p>
              <span
                className="badge text-[10px]"
                style={{ color: d.leadStatus.color, backgroundColor: d.leadStatus.bg }}
              >
                {d.leadStatusLabel}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---- Lead Detail Panel ----
function LeadDetailPanel({ lead, onClose }) {
  const [activeTab, setActiveTab] = useState('info')

  if (!lead) return null

  const ic = interestColors[lead.interestLevel] || interestColors['Chưa đánh giá']

  return (
    <div className="card h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <img src={lead.customerAvatar} alt={lead.customerName} className="w-10 h-10 rounded-full object-cover" />
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">{lead.customerName}</h3>
            <p className="text-xs text-slate-500">{lead.customerPhone}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
          <X size={18} />
        </button>
      </div>

      {/* Status + Hot */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2 flex-shrink-0">
        {lead.isHot && <span className="badge bg-orange-100 text-orange-600 text-xs">Hot</span>}
        <span
          className="badge text-xs"
          style={{ color: lead.leadStatus.color, backgroundColor: lead.leadStatus.bg }}
        >
          {lead.leadStatusLabel}
        </span>
        <span className={clsx('badge text-xs', ic.bg, ic.text)}>{lead.interestLevel}</span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 flex-shrink-0">
        {[
          { id: 'info', label: 'Thông tin' },
          { id: 'timeline', label: 'Timeline' },
          { id: 'calls', label: 'Cuộc gọi' },
          { id: 'notes', label: 'Ghi chú' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'flex-1 py-2 text-xs font-medium transition-colors',
              activeTab === tab.id
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'info' && (
          <div className="p-4 space-y-4">
            {/* Service & Source */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Dịch vụ</p>
                <p className="text-sm font-medium text-slate-800">{lead.serviceName}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Nguồn</p>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: lead.leadSource.color }}
                  />
                  <p className="text-sm font-medium text-slate-800">{lead.leadSource.label}</p>
                </div>
              </div>
            </div>

            {/* Tele */}
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">Tele phụ trách</p>
              {lead.teleUserName ? (
                <p className="text-sm font-medium text-slate-800">{lead.teleUserName}</p>
              ) : (
                <p className="text-sm text-amber-600">Chưa chia</p>
              )}
              {lead.teleGroup && <p className="text-xs text-slate-400 mt-0.5">{lead.teleGroup}</p>}
            </div>

            {/* Page */}
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">Page</p>
              <p className="text-sm font-medium text-slate-800">{lead.pageName}</p>
              {lead.campaignName && <p className="text-xs text-slate-400 mt-0.5">Chiến dịch: {lead.campaignName}</p>}
            </div>

            {/* Revenue */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Doanh thu</p>
                <p className="text-sm font-bold text-emerald-600">{formatCurrency(lead.revenue)}</p>
              </div>
              {lead.depositAmount > 0 && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Đã đặt cọc</p>
                  <p className="text-sm font-bold text-blue-600">{formatCurrency(lead.depositAmount)}</p>
                </div>
              )}
            </div>

            {/* Appointment */}
            {lead.appointmentAt && (
              <div className="bg-amber-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Lịch hẹn</p>
                <p className="text-sm font-medium text-amber-700">{formatDateTime(lead.appointmentAt)}</p>
                {lead.appointmentBranch && (
                  <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
                    <MapPin size={10} /> {lead.appointmentBranch.name}
                  </p>
                )}
              </div>
            )}

            {/* Note */}
            {lead.note && (
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Ghi chú Tele</p>
                <p className="text-sm text-slate-700">{lead.note}</p>
              </div>
            )}

            {/* Meta */}
            <div className="text-xs text-slate-400 space-y-1">
              <p>Tạo: {formatDateTime(lead.createdAt)}</p>
              <p>Cập nhật: {formatDateTime(lead.updatedAt)}</p>
              <p>Số cuộc gọi: {lead.callCount}</p>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="p-4">
            <div className="relative">
              {lead.timeline.map((item, idx) => (
                <div key={item.id} className="flex gap-3 pb-6 relative">
                  {/* Line */}
                  {idx < lead.timeline.length - 1 && (
                    <div className="absolute left-[9px] top-6 bottom-0 w-0.5 bg-slate-200" />
                  )}
                  {/* Dot */}
                  <div className="w-[18px] h-[18px] rounded-full border-2 border-white flex-shrink-0 mt-0.5 z-10" style={{ backgroundColor: '#3b82f6' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{item.action}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.detail}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.by} · {formatDateTime(item.at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'calls' && (
          <div className="p-4 space-y-3">
            {lead.callHistory.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Chưa có cuộc gọi</p>
            ) : (
              lead.callHistory.map((call) => (
                <div key={call.id} className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500">{formatDateTime(call.at)}</span>
                    <span className="text-xs text-slate-400">{call.duration}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-700">{call.result}</p>
                  <p className="text-xs text-slate-500 mt-1">{call.note}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="p-4 space-y-3">
            {lead.notes.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Chưa có ghi chú</p>
            ) : (
              lead.notes.map((note) => (
                <div key={note.id} className="bg-slate-50 rounded-lg p-3">
                  <p className="text-sm text-slate-700">{note.content}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {note.by} · {formatDateTime(note.at)}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ---- Kanban Card ----
function KanbanCard({ lead, onClick, isSelected }) {
  const ic = interestColors[lead.interestLevel] || interestColors['Chưa đánh giá']

  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-white rounded-lg p-3 border cursor-pointer transition-all hover:shadow-md',
        isSelected ? 'border-primary-400 shadow-md' : 'border-slate-200 hover:border-slate-300'
      )}
    >
      <div className="flex items-start gap-2 mb-2">
        <img src={lead.customerAvatar} alt={lead.customerName} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-800 truncate">{lead.customerName}</p>
          <p className="text-xs text-slate-500 truncate">{lead.customerPhone}</p>
        </div>
        {lead.isHot && <Flame size={14} className="text-orange-500 flex-shrink-0" />}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: lead.service.color }} />
          <span className="text-xs text-slate-600 truncate">{lead.serviceName}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: lead.leadSource.color }} />
          <span className="text-xs text-slate-500 truncate">{lead.leadSource.label}</span>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className={clsx('badge text-[10px]', ic.bg, ic.text)}>{lead.interestLevel}</span>
        {lead.appointmentAt && (
          <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
            <Calendar size={10} />
            {formatDate(lead.appointmentAt)}
          </span>
        )}
      </div>
    </div>
  )
}

// ---- Kanban View ----
function KanbanView({ leads, selectedLead, onSelectLead }) {
  const kanbanStatuses = funnelStages

  const getLeadsForStatus = (statusId) => {
    return leads.filter((l) => l.leadStatusId === statusId)
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {kanbanStatuses.map((stage) => {
        const stageLeads = getLeadsForStatus(stage.statusId)
        return (
          <div key={stage.statusId} className="flex-shrink-0 w-[280px]">
            {/* Column Header */}
            <div
              className="rounded-lg px-3 py-2 mb-2 flex items-center justify-between"
              style={{ backgroundColor: stage.color + '18' }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: stage.color }}
                />
                <span className="text-sm font-semibold" style={{ color: stage.color }}>
                  {stage.label}
                </span>
              </div>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: stage.color + '22', color: stage.color }}
              >
                {stageLeads.length}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-2 min-h-[200px]">
              {stageLeads.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center">
                  <p className="text-xs text-slate-400">Không có lead</p>
                </div>
              ) : (
                stageLeads.map((lead) => (
                  <KanbanCard
                    key={lead.leadId}
                    lead={lead}
                    onClick={() => onSelectLead(lead)}
                    isSelected={selectedLead?.leadId === lead.leadId}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ---- Table View ----
function TableView({ leads, selectedLead, onSelectLead }) {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterService, setFilterService] = useState('all')
  const [filterSource, setFilterSource] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [sortField, setSortField] = useState('updatedAt')
  const [sortDir, setSortDir] = useState('desc')

  const filtered = useMemo(() => {
    let data = [...leads]

    if (search) {
      const q = search.toLowerCase()
      data = data.filter(
        (l) =>
          l.customerName.toLowerCase().includes(q) ||
          l.customerPhone.includes(q) ||
          l.leadId.toLowerCase().includes(q)
      )
    }

    if (filterStatus !== 'all') data = data.filter((l) => l.leadStatusId === filterStatus)
    if (filterService !== 'all') data = data.filter((l) => l.serviceId === filterService)
    if (filterSource !== 'all') data = data.filter((l) => l.leadSourceId === filterSource)

    data.sort((a, b) => {
      let va = a[sortField]
      let vb = b[sortField]
      if (sortField === 'interestLevel') {
        va = interestOrder[va] ?? 0
        vb = interestOrder[vb] ?? 0
      }
      if (sortField === 'callCount') {
        va = Number(va)
        vb = Number(vb)
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return data
  }, [leads, search, filterStatus, filterService, filterSource, sortField, sortDir])

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="text-slate-300" />
    return sortDir === 'asc'
      ? <ChevronRight size={12} className="text-primary-500 rotate-90" />
      : <ChevronRight size={12} className="text-primary-500 -rotate-90" />
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
          {(filterStatus !== 'all' || filterService !== 'all' || filterSource !== 'all') && (
            <span className="w-5 h-5 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">!</span>
          )}
        </button>
        <button className="btn-primary text-sm">
          <Plus size={15} />
          Tạo Lead
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Trạng thái</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="select-field text-sm">
              <option value="all">Tất cả</option>
              {leadStatuses.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Dịch vụ</label>
            <select value={filterService} onChange={(e) => setFilterService(e.target.value)} className="select-field text-sm">
              <option value="all">Tất cả dịch vụ</option>
              {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Nguồn</label>
            <select value={filterSource} onChange={(e) => setFilterSource(e.target.value)} className="select-field text-sm">
              <option value="all">Tất cả nguồn</option>
              {leadSources.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px]">
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
              <th className="table-header text-left">Nguồn</th>
              <th className="table-header text-left">Page</th>
              <th className="table-header text-left">Tele</th>
              <th className="table-header text-left">Trạng thái</th>
              <th className="table-header text-left">
                <button onClick={() => toggleSort('interestLevel')} className="flex items-center gap-1">
                  <Star size={12} />
                  <SortIcon field="interestLevel" />
                </button>
              </th>
              <th className="table-header text-left">Doanh thu</th>
              <th className="table-header text-left">
                <button onClick={() => toggleSort('updatedAt')} className="flex items-center gap-1">
                  Cập nhật
                  <SortIcon field="updatedAt" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="table-cell text-center py-12 text-slate-400">
                  Không tìm thấy lead nào
                </td>
              </tr>
            ) : (
              filtered.map((lead) => {
                const ic = interestColors[lead.interestLevel] || interestColors['Chưa đánh giá']
                return (
                  <tr
                    key={lead.leadId}
                    onClick={() => onSelectLead(lead)}
                    className={clsx(
                      'table-row cursor-pointer',
                      selectedLead?.leadId === lead.leadId && 'bg-primary-50 border-l-2 border-l-primary-500'
                    )}
                  >
                    <td className="table-cell">
                      {lead.isHot && <Flame size={16} className="text-orange-500" />}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <img src={lead.customerAvatar} alt={lead.customerName} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 text-sm truncate">{lead.customerName}</p>
                          <p className="text-xs text-slate-500">{lead.customerPhone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: lead.service.color }} />
                        <span className="text-sm font-medium">{lead.serviceName}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: lead.leadSource.color }} />
                        <span className="text-sm text-slate-600">{lead.leadSource.label}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="text-sm text-slate-600">{lead.pageName}</span>
                    </td>
                    <td className="table-cell">
                      {lead.teleUserName ? (
                        <span className="text-sm text-slate-700">{lead.teleUserName}</span>
                      ) : (
                        <span className="text-xs text-amber-500">Chưa chia</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <span
                        className="badge text-[11px]"
                        style={{ color: lead.leadStatus.color, backgroundColor: lead.leadStatus.bg }}
                      >
                        {lead.leadStatusLabel}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={clsx('badge text-[11px]', ic.bg, ic.text)}>{lead.interestLevel}</span>
                    </td>
                    <td className="table-cell">
                      {lead.revenue > 0 ? (
                        <span className="text-sm font-medium text-emerald-600">{formatCurrency(lead.revenue)}</span>
                      ) : (
                        <span className="text-slate-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <span className="text-xs text-slate-400">{formatDate(lead.updatedAt)}</span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Hiển thị <span className="font-medium text-slate-700">{filtered.length}</span> / {leads.length} lead
        </p>
        <div className="flex items-center gap-1">
          <button className="btn-secondary px-3 py-1.5 text-xs" disabled>Trước</button>
          <button className="btn-primary px-3 py-1.5 text-xs">1</button>
          <button className="btn-secondary px-3 py-1.5 text-xs">Sau</button>
        </div>
      </div>
    </div>
  )
}

// ---- Funnel Bar ----
function FunnelBar({ stats }) {
  const maxCount = Math.max(...stats.funnel.map((f) => f.count), 1)

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-700">Phễu Lead</h3>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span>Tổng: <b className="text-slate-700">{stats.total}</b></span>
          <span>Doanh thu: <b className="text-emerald-600">{formatCurrency(stats.revenue.total)}</b></span>
          <span>Đặt cọc: <b className="text-blue-600">{formatCurrency(stats.revenue.deposit)}</b></span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {stats.funnel.map((stage, idx) => {
          const widthPct = maxCount > 0 ? (stage.count / maxCount) * 100 : 0
          return (
            <div key={stage.id} className="flex-1 flex flex-col items-center group relative">
              <div className="w-full flex justify-center">
                <div
                  className="h-8 rounded-md transition-all group-hover:opacity-80 relative"
                  style={{
                    width: `${Math.max(widthPct, 8)}%`,
                    backgroundColor: stage.color,
                    minWidth: '32px',
                  }}
                  title={`${stage.label}: ${stage.count}`}
                >
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[11px] font-semibold whitespace-nowrap" style={{ color: stage.color }}>
                    {stage.count}
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 mt-1.5 text-center truncate w-full">{stage.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---- Main Module ----
export default function LeadModule() {
  const [view, setView] = useState('kanban')
  const [selectedLead, setSelectedLead] = useState(null)
  const [showDuplicates, setShowDuplicates] = useState(false)

  const handleSelectLead = (lead) => {
    if (selectedLead?.leadId === lead.leadId) {
      setSelectedLead(null)
    } else {
      setSelectedLead(lead)
      setShowDuplicates(false)
    }
  }

  const handleCloseDetail = () => {
    setSelectedLead(null)
  }

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Funnel Stats */}
      <FunnelBar stats={funnelStats} />

      {/* View Toggle */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-slate-200 w-fit">
          <button
            onClick={() => setView('kanban')}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
              view === 'kanban'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            <LayoutGrid size={15} />
            Kanban
          </button>
          <button
            onClick={() => setView('table')}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
              view === 'table'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            <Table2 size={15} />
            Bảng
          </button>
        </div>

        {/* Quick stats */}
        <div className="hidden md:flex items-center gap-3 text-xs text-slate-500 ml-4">
          <span className="flex items-center gap-1">
            <Flame size={12} className="text-orange-500" /> {leads.filter((l) => l.isHot).length} lead nóng
          </span>
          <span className="flex items-center gap-1">
            <Phone size={12} className="text-slate-400" /> {leads.filter((l) => l.callCount > 0).length} đã gọi
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={12} className="text-emerald-500" /> {leads.filter((l) => l.appointmentAt).length} có lịch hẹn
          </span>
          <span className="flex items-center gap-1">
            <DollarSign size={12} className="text-blue-500" /> {formatCurrency(funnelStats.revenue.total)} doanh thu
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0">
        {view === 'kanban' ? (
          <KanbanView
            leads={leads}
            selectedLead={selectedLead}
            onSelectLead={handleSelectLead}
          />
        ) : (
          <TableView
            leads={leads}
            selectedLead={selectedLead}
            onSelectLead={handleSelectLead}
          />
        )}
      </div>

      {/* Side Panels */}
      {selectedLead && view === 'kanban' && (
        <div className="fixed right-0 top-0 h-full w-[380px] bg-white shadow-2xl z-50 flex flex-col">
          {/* Duplicate warning */}
          <div className="p-3 border-b border-slate-200 flex-shrink-0">
            {!showDuplicates && (
              <button
                onClick={() => setShowDuplicates(true)}
                className="w-full text-left flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <AlertTriangle size={14} />
                Kiểm tra trùng lặp lead này
              </button>
            )}
            {showDuplicates && (
              <DuplicatePanel lead={selectedLead} onClose={() => setShowDuplicates(false)} />
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <LeadDetailPanel lead={selectedLead} onClose={handleCloseDetail} />
          </div>
        </div>
      )}

      {selectedLead && view === 'table' && (
        <div className="fixed right-0 top-0 h-full w-[380px] bg-white shadow-2xl z-50 flex flex-col">
          <div className="p-3 border-b border-slate-200 flex-shrink-0">
            {!showDuplicates && (
              <button
                onClick={() => setShowDuplicates(true)}
                className="w-full text-left flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <AlertTriangle size={14} />
                Kiểm tra trùng lặp lead này
              </button>
            )}
            {showDuplicates && (
              <DuplicatePanel lead={selectedLead} onClose={() => setShowDuplicates(false)} />
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <LeadDetailPanel lead={selectedLead} onClose={handleCloseDetail} />
          </div>
        </div>
      )}

      {/* Overlay */}
      {selectedLead && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={handleCloseDetail}
        />
      )}
    </div>
  )
}
