import { useState, useMemo } from 'react'
import TeleDashboard from './TeleDashboard'
import TeleLeadList from './TeleLeadList'
import TeleLeadDetail from './TeleLeadDetail'
import TeleScripts from './TeleScripts'
import TeleCalendar from './TeleCalendar'
import { Phone, LayoutList, Calendar, FileText } from 'lucide-react'
import { teleLeads } from '../../data/mockData'
import clsx from 'clsx'

const QUICK_FILTERS = [
  { id: 'all', label: 'Tất cả', color: '#3b82f6' },
  { id: 'new', label: 'Khách mới', color: '#8b5cf6' },
  { id: 'due_today', label: 'Đến hạn', color: '#10b981' },
  { id: 'overdue', label: 'Quá hạn', color: '#ef4444' },
]

const VIEW_TABS = [
  { id: 'list', label: 'Danh sách Lead', icon: LayoutList },
  { id: 'calendar', label: 'Lịch hẹn', icon: Calendar },
  { id: 'scripts', label: 'Kịch bản Tele', icon: FileText },
]

function ViewTabs({ view, onChange }) {
  return (
    <div className="w-full overflow-x-auto pb-0.5">
      <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-slate-200 w-full sm:min-w-max">
        {VIEW_TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={clsx(
                'flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0',
                view === tab.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              <Icon size={15} />
              <span className="hidden xs:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function QuickFilterTabs({ quickFilter, onChange, counts }) {
  return (
    <div className="w-full overflow-x-auto pb-0.5">
      <div className="flex items-center gap-1.5 min-w-max">
        {QUICK_FILTERS.map((f) => {
          const count = counts[f.id] || 0
          const isActive = quickFilter === f.id || (f.id === 'all' && !quickFilter)
          return (
            <button
              key={f.id}
              onClick={() => onChange(f.id)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0',
                isActive
                  ? 'text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
              style={isActive ? { backgroundColor: f.color } : {}}
            >
              {f.id === 'overdue' && count > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse flex-shrink-0" />
              )}
              {f.label}
              <span
                className={clsx(
                  'ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold min-w-[18px] text-center',
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                )}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function TeleModule() {
  const [selectedLead, setSelectedLead] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [view, setView] = useState('list')
  const [refreshKey, setRefreshKey] = useState(0)
  const [quickFilter, setQuickFilter] = useState('all')

  const counts = useMemo(() => {
    const now = new Date()
    const todayStr = now.toDateString()
    return {
      all: teleLeads.length,
      new: teleLeads.filter((l) => l.leadStatusId === 'ls_01' || l.callCount === 0).length,
      due_today: teleLeads.filter((l) => {
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
  }, [])

  const handleSelectLead = (lead) => setSelectedLead(lead)
  const handleCloseDetail = () => setSelectedLead(null)
  const handleSave = () => setRefreshKey((k) => k + 1)

  const handleCall = (leadId, phoneNumber) => {
    console.log(`[CALL] leadId=${leadId}, phone=${phoneNumber}`)
    alert(`Đang gọi: ${phoneNumber}`)
  }

  const handleDashboardFilter = (filterKey) => {
    setQuickFilter(filterKey)
    if (view !== 'list') setView('list')
  }

  return (
    <div className="h-full flex flex-col gap-3 lg:gap-4">
      {/* Dashboard — scrollable horizontal strip on mobile */}
      <div className="flex-shrink-0">
        <TeleDashboard onFilterClick={handleDashboardFilter} activeFilter={quickFilter} />
      </div>

      {/* View Tabs */}
      <div className="flex-shrink-0">
        <ViewTabs view={view} onChange={setView} />
      </div>

      {/* Quick Filter Tabs — only in list view */}
      {view === 'list' && (
        <div className="flex-shrink-0">
          <QuickFilterTabs quickFilter={quickFilter} onChange={setQuickFilter} counts={counts} />
        </div>
      )}

      {/* Scrollable content area */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* ======= LIST VIEW ======= */}
        {view === 'list' && (
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-3 lg:gap-4">
            {/* Lead List */}
            <div className={clsx('xl:col-span-3', selectedLead && 'xl:col-span-3')}>
              <TeleLeadList
                key={refreshKey}
                onSelectLead={handleSelectLead}
                selectedLeadId={selectedLead?.leadId}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                quickFilter={quickFilter}
                onCall={handleCall}
              />
            </div>

            {/* Lead Detail */}
            {selectedLead ? (
              <div className="xl:col-span-2">
                <TeleLeadDetail
                  key={selectedLead.leadId}
                  lead={selectedLead}
                  onClose={handleCloseDetail}
                  onSave={handleSave}
                />
              </div>
            ) : (
              <div className="hidden xl:flex xl:col-span-2 items-start">
                <div className="card w-full flex items-center justify-center py-12 lg:py-16">
                  <div className="text-center">
                    <div className="w-14 h-14 lg:w-16 lg:h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
                      <Phone size={26} className="text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-medium text-sm">Chọn lead để xem chi tiết</p>
                    <p className="text-xs text-slate-400 mt-1 hidden xl:block">Click vào lead trong danh sách</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======= CALENDAR VIEW ======= */}
        {view === 'calendar' && (
          <TeleCalendar />
        )}

        {/* ======= SCRIPTS VIEW ======= */}
        {view === 'scripts' && (
          <TeleScripts />
        )}
      </div>
    </div>
  )
}
