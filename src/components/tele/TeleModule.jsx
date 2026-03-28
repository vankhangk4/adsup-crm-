import { useState } from 'react'
import TeleDashboard from './TeleDashboard'
import TeleLeadList from './TeleLeadList'
import TeleLeadDetail from './TeleLeadDetail'
import TeleScripts from './TeleScripts'
import TeleCalendar from './TeleCalendar'
import {
  Phone,
  LayoutList,
  Calendar,
  FileText,
  BarChart3,
} from 'lucide-react'
import clsx from 'clsx'

export default function TeleModule() {
  const [selectedLead, setSelectedLead] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [view, setView] = useState('list') // 'list' | 'calendar' | 'scripts'
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSelectLead = (lead) => {
    setSelectedLead(lead)
  }

  const handleCloseDetail = () => {
    setSelectedLead(null)
  }

  const handleSave = () => {
    setRefreshKey((k) => k + 1)
  }

  const viewTabs = [
    { id: 'list', label: 'Danh sách Lead', icon: LayoutList },
    { id: 'calendar', label: 'Lịch hẹn', icon: Calendar },
    { id: 'scripts', label: 'Kịch bản Tele', icon: FileText },
  ]

  return (
    <div className="relative h-full flex flex-col gap-4">
      {/* Dashboard Stats */}
      <TeleDashboard />

      {/* View Toggle */}
      <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-slate-200 w-fit">
        {viewTabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
                view === tab.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      {view === 'list' && (
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
          {/* Lead List — 3/5 width */}
          <div className={clsx('lg:col-span-3', selectedLead && 'hidden lg:block')}>
            <TeleLeadList
              key={refreshKey}
              onSelectLead={handleSelectLead}
              selectedLeadId={selectedLead?.leadId}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
            />
          </div>

          {/* Lead Detail — 2/5 width */}
          <div className={clsx('lg:col-span-2', !selectedLead && 'hidden')}>
            <div className="sticky top-0 max-h-[calc(100vh-220px)] overflow-hidden">
              <TeleLeadDetail
                key={selectedLead?.leadId}
                lead={selectedLead}
                onClose={handleCloseDetail}
                onSave={handleSave}
              />
            </div>
          </div>

          {/* Empty state when no lead selected on desktop */}
          {!selectedLead && (
            <div className="hidden lg:flex lg:col-span-2 items-start">
              <div className="card w-full flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone size={28} className="text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">Chọn lead để xem chi tiết</p>
                  <p className="text-sm text-slate-400 mt-1">Click vào lead trong danh sách</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {view === 'calendar' && <TeleCalendar />}

      {view === 'scripts' && <TeleScripts />}
    </div>
  )
}
