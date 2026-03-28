import { useState } from 'react'
import clsx from 'clsx'
import {
  Phone,
  PhoneMissed,
  PhoneOutgoing,
  Clock,
  Calendar,
  MapPin,
  Star,
  MessageSquare,
  Plus,
  ChevronDown,
  Check,
  X,
  Save,
  AlertTriangle,
  FileText,
  RefreshCw,
  Edit3,
} from 'lucide-react'
import {
  leadStatuses,
  callResults,
  closeStatuses,
  branches,
  services,
  scriptTemplates,
} from '../../data/mockData'

export default function TeleLeadDetail({ lead, onClose, onSave }) {
  const [activeTab, setActiveTab] = useState('call')
  const [showScript, setShowScript] = useState(false)
  const [showAppointModal, setShowAppointModal] = useState(false)
  const [showNoteInput, setShowNoteInput] = useState(false)

  // Form state for call update
  const [callForm, setCallForm] = useState({
    callStatus: 'answered',
    callResultId: '',
    note: '',
    nextFollowUpDate: '',
    nextFollowUpTime: '',
    appointmentDate: '',
    appointmentTime: '',
    appointmentBranchId: '',
    revenue: '',
    closeStatus: 'open',
  })

  const [newNote, setNewNote] = useState('')

  // Call logs state
  const [callLogs, setCallLogs] = useState(lead?.callLogs || [])
  const [followUps, setFollowUps] = useState(lead?.followUps || [])
  const [teleNotes, setTeleNotes] = useState(lead?.teleNotes || [])
  const [currentStatus, setCurrentStatus] = useState(lead?.leadStatus || 'new')
  const [saved, setSaved] = useState(false)

  if (!lead) {
    return (
      <div className="card h-full flex items-center justify-center">
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone size={28} className="text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">Chọn một lead để xem chi tiết</p>
          <p className="text-sm text-slate-400 mt-1">Click vào lead trong danh sách để xem</p>
        </div>
      </div>
    )
  }

  const handleSaveCall = () => {
    if (!callForm.callResultId) {
      alert('Vui lòng chọn kết quả cuộc gọi')
      return
    }

    const selectedResult = callResults.find((r) => r.id === callForm.callResultId)

    // Create new call log
    const newLog = {
      id: `clog_${Date.now()}`,
      leadId: lead.leadId,
      teleUserId: lead.teleUserId,
      callAt: new Date().toISOString(),
      callStatus: callForm.callStatus,
      callResult: selectedResult,
      callResultId: callForm.callResultId,
      duration: Math.floor(Math.random() * 600),
      note: callForm.note,
      nextFollowUpAt: callForm.nextFollowUpDate
        ? new Date(`${callForm.nextFollowUpDate}T${callForm.nextFollowUpTime || '00:00'}`).toISOString()
        : null,
      appointmentAt: callForm.appointmentDate
        ? new Date(`${callForm.appointmentDate}T${callForm.appointmentTime || '00:00'}`).toISOString()
        : null,
      appointmentBranch: branches.find((b) => b.id === callForm.appointmentBranchId),
    }

    setCallLogs([...callLogs, newLog])

    // Create follow-up if next follow-up is set
    if (callForm.nextFollowUpDate) {
      const newFollowUp = {
        id: `fu_${Date.now()}`,
        leadId: lead.leadId,
        teleUserId: lead.teleUserId,
        scheduledAt: new Date(`${callForm.nextFollowUpDate}T${callForm.nextFollowUpTime || '00:00'}`).toISOString(),
        status: 'pending',
        result: null,
        createdAt: new Date().toISOString(),
      }
      setFollowUps([...followUps, newFollowUp])
    }

    // Update status based on result
    let newStatus = currentStatus
    if (selectedResult?.id === 'cr_01' && callForm.appointmentDate) {
      newStatus = leadStatuses.find((s) => s.id === 'ls_04') // Hẹn lịch
    } else if (selectedResult?.id === 'cr_01' && !callForm.appointmentDate) {
      newStatus = leadStatuses.find((s) => s.id === 'ls_01') // Mới tiếp nhận
    } else if (selectedResult?.id === 'cr_03') {
      newStatus = leadStatuses.find((s) => s.id === 'ls_09') // Từ chối
    } else if (selectedResult?.id === 'cr_04') {
      newStatus = leadStatuses.find((s) => s.id === 'ls_08') // Không liên lạc được
    }
    setCurrentStatus(newStatus)

    // Reset form
    setCallForm({
      callStatus: 'answered',
      callResultId: '',
      note: '',
      nextFollowUpDate: '',
      nextFollowUpTime: '',
      appointmentDate: '',
      appointmentTime: '',
      appointmentBranchId: '',
      revenue: '',
      closeStatus: 'open',
    })

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    if (onSave) onSave()
  }

  const handleAddNote = () => {
    if (!newNote.trim()) return
    const note = {
      id: `tn_${Date.now()}`,
      leadId: lead.leadId,
      teleUserId: lead.teleUserId,
      teleUserName: lead.teleUser.name,
      content: newNote,
      createdAt: new Date().toISOString(),
    }
    setTeleNotes([note, ...teleNotes])
    setNewNote('')
    setShowNoteInput(false)
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '0s'
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return m > 0 ? `${m}p ${s}giây` : `${s}giây`
  }

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const tabs = [
    { id: 'call', label: 'Cuộc gọi', count: callLogs.length },
    { id: 'note', label: 'Ghi chú', count: teleNotes.length },
    { id: 'followup', label: 'Follow-up', count: followUps.length },
    { id: 'info', label: 'Thông tin Lead' },
  ]

  const interestColors = {
    'Rất cao': 'bg-red-100 text-red-700',
    'Cao': 'bg-orange-100 text-orange-700',
    'Trung bình': 'bg-amber-100 text-amber-700',
    'Thấp': 'bg-slate-100 text-slate-600',
    'Chưa đánh giá': 'bg-slate-50 text-slate-400',
  }

  return (
    <div className="card h-full flex flex-col overflow-hidden">
      {/* Lead Header */}
      <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white flex-shrink-0">
        <div className="flex items-start gap-3">
          <img
            src={lead.customerAvatar}
            alt={lead.customerName}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-200 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-semibold text-slate-800">{lead.customerName}</h2>
              {lead.isHot && (
                <span className="badge bg-orange-100 text-orange-600 text-[10px]">
                  🔥 Lead nóng
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-0.5">{lead.customerPhone}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: lead.service.color }}
              />
              <span className="text-xs font-medium text-slate-600">{lead.service.name}</span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-400">{lead.page.name}</span>
              <span
                className={clsx('badge text-[11px]', interestColors[lead.interestLevel])}
              >
                {lead.interestLevel}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Status bar */}
        <div className="flex items-center gap-3 mt-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500">Trạng thái</span>
              <span
                className="badge text-[11px]"
                style={{ color: currentStatus.color, backgroundColor: currentStatus.bg }}
              >
                {currentStatus.label}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Phone size={12} /> {lead.callCount} cuộc gọi
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={12} /> {lead.appointmentAt ? formatDate(lead.appointmentAt) : 'Chưa đặt'}
            </span>
          </div>
        </div>

        {lead.appointmentAt && (
          <div className="mt-2 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
            <Calendar size={14} className="text-emerald-600 flex-shrink-0" />
            <div className="text-xs">
              <span className="text-emerald-700 font-medium">Lịch hẹn: </span>
              <span className="text-emerald-600">
                {formatDateTime(lead.appointmentAt)} — {lead.appointmentBranch?.name}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 border-b border-slate-200 px-4">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'px-3 py-2.5 text-sm font-medium border-b-2 transition-colors relative',
                activeTab === tab.id
                  ? 'text-primary-600 border-primary-600'
                  : 'text-slate-500 border-transparent hover:text-slate-700'
              )}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1.5 text-[11px] bg-slate-200 text-slate-600 rounded-full px-1.5 py-0.5">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {/* ===== CALL TAB ===== */}
        {activeTab === 'call' && (
          <div className="p-4 space-y-4">
            {/* Quick action */}
            <div className="flex items-center gap-2">
              <button className="btn-success flex-1">
                <Phone size={15} />
                Gọi ngay
              </button>
              <button
                className="btn-secondary flex-1"
                onClick={() => setShowScript(!showScript)}
              >
                <FileText size={15} />
                Script
              </button>
            </div>

            {/* Script Panel */}
            {showScript && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-blue-800">Kịch bản Tele</h4>
                  <button onClick={() => setShowScript(false)}>
                    <X size={14} className="text-blue-500" />
                  </button>
                </div>
                <div className="space-y-2">
                  {scriptTemplates.map((script) => (
                    <details key={script.id} className="group">
                      <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-blue-700 hover:text-blue-800">
                        <ChevronRight size={14} className="group-open:rotate-90 transition-transform" />
                        [{script.category}] {script.name}
                      </summary>
                      <p className="mt-2 text-sm text-blue-600 bg-white rounded-lg p-3 border border-blue-100 ml-5">
                        {script.content}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {/* Call Result Form */}
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Phone size={15} className="text-primary-500" />
                Cập nhật cuộc gọi
              </h4>

              {/* Call Status */}
              <div className="mb-3">
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Trạng thái cuộc gọi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setCallForm({ ...callForm, callStatus: 'answered' })}
                    className={clsx(
                      'flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium border transition-all',
                      callForm.callStatus === 'answered'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    <PhoneOutgoing size={14} /> Nghe máy
                  </button>
                  <button
                    onClick={() => setCallForm({ ...callForm, callStatus: 'no_answer' })}
                    className={clsx(
                      'flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium border transition-all',
                      callForm.callStatus === 'no_answer'
                        ? 'bg-amber-50 border-amber-300 text-amber-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    <PhoneMissed size={14} /> Không nghe máy
                  </button>
                </div>
              </div>

              {/* Call Result */}
              <div className="mb-3">
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                  Kết quả <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {callResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => setCallForm({ ...callForm, callResultId: result.id })}
                      className={clsx(
                        'px-2.5 py-1.5 rounded-lg text-xs font-medium border text-left transition-all',
                        callForm.callResultId === result.id
                          ? 'bg-primary-50 border-primary-300 text-primary-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      {result.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div className="mb-3">
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Ghi chú cuộc gọi</label>
                <textarea
                  value={callForm.note}
                  onChange={(e) => setCallForm({ ...callForm, note: e.target.value })}
                  placeholder="Nhập nội dung cuộc gọi, ý kiến khách hàng..."
                  rows={3}
                  className="input-field resize-none"
                />
              </div>

              {/* Appointment */}
              {callForm.callResultId === 'cr_01' && (
                <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <h5 className="text-xs font-semibold text-amber-700 mb-2 flex items-center gap-1">
                    <Calendar size={13} /> Hẹn lịch khám
                  </h5>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-500 mb-1 block">Ngày hẹn</label>
                      <input
                        type="date"
                        value={callForm.appointmentDate}
                        onChange={(e) => setCallForm({ ...callForm, appointmentDate: e.target.value })}
                        className="input-field text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 mb-1 block">Giờ hẹn</label>
                      <input
                        type="time"
                        value={callForm.appointmentTime}
                        onChange={(e) => setCallForm({ ...callForm, appointmentTime: e.target.value })}
                        className="input-field text-sm"
                      />
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="text-[11px] text-slate-500 mb-1 block">Chi nhánh</label>
                    <select
                      value={callForm.appointmentBranchId}
                      onChange={(e) => setCallForm({ ...callForm, appointmentBranchId: e.target.value })}
                      className="select-field text-sm"
                    >
                      <option value="">Chọn chi nhánh</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Next Follow-up */}
              <div className="mb-3">
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Hẹn gọi lại</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={callForm.nextFollowUpDate}
                    onChange={(e) => setCallForm({ ...callForm, nextFollowUpDate: e.target.value })}
                    className="input-field text-sm"
                  />
                  <input
                    type="time"
                    value={callForm.nextFollowUpTime}
                    onChange={(e) => setCallForm({ ...callForm, nextFollowUpTime: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
              </div>

              {/* Save button */}
              <div className="flex items-center gap-2">
                <button onClick={handleSaveCall} className="btn-primary flex-1">
                  <Save size={15} />
                  Lưu cuộc gọi
                </button>
                <button
                  onClick={() => setCallForm({
                    callStatus: 'answered', callResultId: '', note: '',
                    nextFollowUpDate: '', nextFollowUpTime: '', appointmentDate: '',
                    appointmentTime: '', appointmentBranchId: '', revenue: '', closeStatus: 'open',
                  })}
                  className="btn-secondary"
                >
                  <RefreshCw size={14} />
                </button>
              </div>

              {saved && (
                <div className="mt-2 flex items-center justify-center gap-1 text-emerald-600 text-sm font-medium">
                  <Check size={14} /> Đã lưu thành công
                </div>
              )}
            </div>

            {/* Call History */}
            {callLogs.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Clock size={15} className="text-slate-400" />
                  Lịch sử cuộc gọi ({callLogs.length})
                </h4>
                <div className="space-y-2">
                  {[...callLogs].reverse().map((log) => (
                    <div
                      key={log.id}
                      className="bg-white border border-slate-200 rounded-xl p-3 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={clsx(
                              'w-2 h-2 rounded-full',
                              log.callStatus === 'answered' ? 'bg-emerald-500' : 'bg-amber-500'
                            )}
                          />
                          <span className="text-xs font-medium text-slate-700">
                            {formatDateTime(log.callAt)}
                          </span>
                          <span className="text-xs text-slate-400">{formatDuration(log.duration)}</span>
                        </div>
                        <span
                          className="badge text-[10px]"
                          style={{ color: log.callResult?.color || '#6b7280', backgroundColor: '#f3f4f6' }}
                        >
                          {log.callResult?.label}
                        </span>
                      </div>
                      {log.note && (
                        <p className="text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
                          {log.note}
                        </p>
                      )}
                      {log.appointmentAt && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 rounded-lg px-3 py-1.5">
                          <Calendar size={12} />
                          Hẹn lịch: {formatDateTime(log.appointmentAt)}
                          {log.appointmentBranch && ` — ${log.appointmentBranch.name}`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== NOTE TAB ===== */}
        {activeTab === 'note' && (
          <div className="p-4 space-y-4">
            <button
              onClick={() => setShowNoteInput(!showNoteInput)}
              className="btn-primary w-full"
            >
              <Plus size={15} />
              Thêm ghi chú
            </button>

            {showNoteInput && (
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Nhập ghi chú về khách hàng..."
                  rows={4}
                  className="input-field resize-none mb-3"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button onClick={handleAddNote} className="btn-primary flex-1">
                    <Check size={14} /> Lưu
                  </button>
                  <button onClick={() => { setShowNoteInput(false); setNewNote('') }} className="btn-secondary">
                    Hủy
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {teleNotes.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  Chưa có ghi chú nào
                </div>
              ) : (
                teleNotes.map((note) => (
                  <div key={note.id} className="bg-white border border-slate-200 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-slate-700">{note.teleUserName}</span>
                      <span className="text-[11px] text-slate-400">{formatDateTime(note.createdAt)}</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{note.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ===== FOLLOW-UP TAB ===== */}
        {activeTab === 'followup' && (
          <div className="p-4 space-y-3">
            {followUps.length === 0 ? (
              <div className="text-center py-12">
                <Clock size={32} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Chưa có lịch follow-up nào</p>
              </div>
            ) : (
              followUps.map((fu) => {
                const isOverdue = fu.status === 'pending' && new Date(fu.scheduledAt) < new Date()
                return (
                  <div
                    key={fu.id}
                    className={clsx(
                      'bg-white border rounded-xl p-3 flex items-center gap-3',
                      isOverdue ? 'border-red-300 bg-red-50' : 'border-slate-200',
                      fu.status === 'done' && 'opacity-70'
                    )}
                  >
                    <div
                      className={clsx(
                        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                        isOverdue ? 'bg-red-100' : fu.status === 'done' ? 'bg-emerald-100' : 'bg-blue-100'
                      )}
                    >
                      {fu.status === 'done' ? (
                        <Check size={16} className="text-emerald-600" />
                      ) : isOverdue ? (
                        <AlertTriangle size={16} className="text-red-600" />
                      ) : (
                        <Clock size={16} className="text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700">
                        {formatDateTime(fu.scheduledAt)}
                      </p>
                      {fu.result && (
                        <p className="text-xs text-slate-500 mt-0.5">{fu.result}</p>
                      )}
                      {isOverdue && (
                        <p className="text-xs text-red-600 font-medium mt-0.5">⚠️ Quá hạn – cần xử lý ngay</p>
                      )}
                    </div>
                    <span
                      className={clsx(
                        'badge text-[11px]',
                        fu.status === 'done'
                          ? 'bg-emerald-100 text-emerald-700'
                          : isOverdue
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                      )}
                    >
                      {fu.status === 'done' ? 'Hoàn thành' : isOverdue ? 'Quá hạn' : 'Đang chờ'}
                    </span>
                  </div>
                )
              })
            )}

            {/* Quick schedule */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Đặt lịch follow-up nhanh</h4>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Hôm nay', hours: 0 },
                  { label: 'Ngày mai', hours: 24 },
                  { label: '2 ngày', hours: 48 },
                  { label: '1 tuần', hours: 168 },
                ].map((opt) => {
                  const date = new Date(Date.now() + opt.hours * 3600000)
                  return (
                    <button
                      key={opt.label}
                      onClick={() => {
                        const d = date.toLocaleDateString('en-CA')
                        setCallForm({ ...callForm, nextFollowUpDate: d })
                        setActiveTab('call')
                      }}
                      className="btn-secondary text-xs py-2"
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===== INFO TAB ===== */}
        {activeTab === 'info' && (
          <div className="p-4 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                <h4 className="text-sm font-semibold text-slate-700">Thông tin khách hàng</h4>
              </div>
              <div className="divide-y divide-slate-100">
                <InfoRow label="Mã Lead" value={lead.leadId} />
                <InfoRow label="Tên khách hàng" value={lead.customerName} />
                <InfoRow label="Số điện thoại" value={lead.customerPhone} />
                <InfoRow label="Dịch vụ quan tâm" value={lead.service.name} />
                <InfoRow label="Nguồn" value={lead.page.name} />
                <InfoRow label="Chiến dịch" value={lead.campaignName} />
                <InfoRow label="Quảng cáo" value={lead.adName} />
                <InfoRow label="Nhóm Tele" value={lead.teleGroup} />
                <InfoRow label="Mức độ quan tâm" value={lead.interestLevel} />
                <InfoRow label="Doanh thu dự kiến" value={lead.revenue > 0 ? `${lead.revenue.toLocaleString()} VNĐ` : '—'} />
                <InfoRow label="Ngày tạo" value={formatDate(lead.createdAt)} />
                <InfoRow label="Cập nhật lần cuối" value={formatDateTime(lead.updatedAt)} />
              </div>
            </div>

            {/* Close status */}
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Kết thúc lead</h4>
              <div className="grid grid-cols-2 gap-2">
                {closeStatuses.map((cs) => (
                  <button
                    key={cs.value}
                    onClick={() => setCallForm({ ...callForm, closeStatus: cs.value })}
                    className={clsx(
                      'px-3 py-2 rounded-lg text-xs font-medium border text-left transition-all',
                      callForm.closeStatus === cs.value
                        ? 'bg-primary-50 border-primary-300 text-primary-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    {cs.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="px-4 py-2.5 flex items-center justify-between">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-sm text-slate-800 font-medium">{value || '—'}</span>
    </div>
  )
}
