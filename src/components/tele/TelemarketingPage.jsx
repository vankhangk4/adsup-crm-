/**
 * TelemarketingPage - Màn hình Team Tele
 * Bố cục: 2 cột - Danh sách Lead (trái) + Chi tiết cuộc gọi (phải)
 * Designer: Senior React & UI/UX Dev | ADSUPX CRM
 */
import { useState, useEffect, useRef } from 'react';
import {
  Search,
  Filter,
  Plus,
  Phone,
  PhoneOff,
  PhoneCall,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  User,
  Zap,
  AlertCircle,
  CheckCircle2,
  XCircle,
  MinusCircle,
  BookOpen,
  StickyNote,
  ArrowRight,
  X,
  ExternalLink,
  RotateCcw,
  MoreHorizontal,
  Download,
  Upload,
  Inbox,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

// ===== STATIC CONFIG (no API dependency) =====

const CALL_RESULTS = [
  { value: 'Answer', label: 'Answer', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', dot: 'bg-green-500' },
  { value: 'Busy', label: 'Busy', icon: MinusCircle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500' },
  { value: 'Wrong Number', label: 'Wrong Number', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500' },
  { value: 'Booked', label: 'Booked', icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500' },
];

const STATUS_OPTIONS = ['Mới', 'Đang xử lý', 'Thành công', 'Từ chối', 'Chưa liên hệ'];
const SERVICE_OPTIONS = ['Tất cả dịch vụ', 'Internet FPT', 'Truyền hình FPT', 'Camera AI', 'FPT Play Box', 'Combo Internet + TV'];
const PRIORITY_OPTIONS = ['Tất cả', 'Cao', 'Trung bình', 'Thấp'];

// ===== COMPONENTS =====

function PriorityBadge({ priority }) {
  if (priority === 'Cao') return (
    <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded bg-red-100 text-red-600 border border-red-200">!</span>
  );
  if (priority === 'Trung bình') return (
    <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded bg-amber-100 text-amber-600 border border-amber-200">~</span>
  );
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded bg-green-100 text-green-600 border border-green-200">↓</span>
  );
}

function StatusToggle({ status, onToggle }) {
  const isActive = status === 'Hoạt động';
  return (
    <button
      onClick={onToggle}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
        isActive
          ? 'bg-green-100 text-green-700 hover:bg-green-200 shadow-sm'
          : 'bg-gray-100 text-gray-500 hover:bg-amber-100 hover:text-amber-700'
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full transition-all ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}
      />
      {isActive ? 'Bật' : 'Hẹn'}
    </button>
  );
}

function TagChip({ label }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-sm">
      {label}
    </span>
  );
}

// ===== EMPTY STATE =====

function EmptyState({ message = 'Chưa có dữ liệu' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Inbox size={24} className="text-gray-300" />
      </div>
      <p className="text-gray-400 text-sm font-medium">{message}</p>
    </div>
  );
}

// ===== LOADING SKELETON =====

function LoadingSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <tr key={i} className="border-b border-gray-50">
          <td className="px-3 py-3 w-12">
            <div className="w-6 h-6 rounded bg-gray-200 animate-pulse" />
          </td>
          <td className="px-3 py-3 min-w-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
              <div className="min-w-0">
                <div className="h-3.5 w-28 bg-gray-200 rounded animate-pulse mb-1" />
                <div className="h-2.5 w-16 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          </td>
          <td className="px-3 py-3">
            <div className="h-3.5 w-20 bg-gray-200 rounded animate-pulse" />
          </td>
          <td className="px-3 py-3 hidden xl:table-cell">
            <div className="h-5 w-24 bg-gray-100 rounded-lg animate-pulse" />
          </td>
          <td className="px-3 py-3 text-center">
            <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse mx-auto" />
          </td>
          <td className="px-3 py-3 hidden lg:table-cell">
            <div className="h-3 w-14 bg-gray-100 rounded animate-pulse" />
          </td>
          <td className="px-3 py-3">
            <div className="flex items-center justify-center gap-1">
              <div className="w-8 h-8 bg-gray-200 rounded-xl animate-pulse" />
              <div className="w-8 h-8 bg-gray-100 rounded-xl animate-pulse" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

// ===== LEAD ROW (link-style phone/name) =====

function LeadRow({ lead, isActive, onSelect, onToggleStatus, onCall }) {
  return (
    <tr
      className={`border-b border-gray-50 transition-all duration-150 ${
        isActive
          ? 'bg-blue-50/60 border-l-2 border-l-blue-500'
          : 'hover:bg-gray-50 cursor-pointer border-l-2 border-l-transparent'
      }`}
      onClick={() => onSelect(lead)}
    >
      {/* PRI */}
      <td className="px-3 py-3 w-12">
        <PriorityBadge priority={lead.priority} />
      </td>

      {/* Tên + Avatar */}
      <td className="px-3 py-3 min-w-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white text-[10px] font-bold">{lead.avatar}</span>
          </div>
          <div className="min-w-0">
            {/* TÊN = LINK gạch chân xanh khi hover */}
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onSelect(lead); }}
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline decoration-1 underline-offset-2 transition-colors truncate block"
            >
              {lead.name}
            </a>
            {/* Tags nhỏ */}
            {lead.tags && lead.tags.length > 0 && (
              <div className="flex gap-1 mt-0.5">
                {lead.tags.slice(0, 2).map((tag) => (
                  <TagChip key={tag} label={tag} />
                ))}
              </div>
            )}
          </div>
        </div>
      </td>

      {/* SĐT = LINK gọi */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-1">
          <a
            href={`tel:${lead.phone.replace(/\s/g, '')}`}
            onClick={(e) => { e.stopPropagation(); }}
            className="text-sm text-blue-500 hover:text-blue-700 hover:underline decoration-1 underline-offset-2 font-medium transition-colors flex items-center gap-1"
          >
            {lead.phone}
            <Phone size={11} className="text-blue-400 flex-shrink-0" />
          </a>
        </div>
      </td>

      {/* Dịch vụ */}
      <td className="px-3 py-3 hidden xl:table-cell">
        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-lg font-medium">
          {lead.service}
        </span>
      </td>

      {/* Trạng thái Toggle */}
      <td className="px-3 py-3 text-center">
        <StatusToggle status={lead.status} onToggle={() => onToggleStatus(lead.id)} />
      </td>

      {/* Follow-up */}
      <td className="px-3 py-3 hidden lg:table-cell">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Clock size={11} className="text-gray-400 flex-shrink-0" />
          <span className={lead.followUp === '-' ? 'text-gray-300' : 'text-gray-600'}>
            {lead.followUp === '-' ? '—' : lead.followUp.split(' ')[1]}
          </span>
        </div>
      </td>

      {/* Actions */}
      <td className="px-3 py-3">
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onCall(lead); }}
            className="p-2 rounded-xl bg-green-500 hover:bg-green-600 text-white transition-all duration-150 shadow-sm hover:shadow-md active:scale-95"
            title="Gọi điện"
          >
            <PhoneCall size={14} />
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-all duration-150 active:scale-95"
            title="Xem chi tiết"
          >
            <ExternalLink size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ===== CALL PANEL =====

function CallPanel({ lead, isCallActive, callDuration, callResult, setCallResult, scripts, script, setScript, callNote, setCallNote, followUpDate, setFollowUpDate, leadStatus, setLeadStatus, onStartCall, onEndCall, formatDuration }) {
  const toast = useToast();

  if (!lead) {
    return (
      <div className="w-[420px] flex-shrink-0 flex items-center justify-center bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Phone size={24} className="text-gray-300" />
          </div>
          <p className="text-gray-400 text-sm font-medium">Chọn một khách hàng</p>
          <p className="text-gray-300 text-xs mt-1">để xem chi tiết & bắt đầu cuộc gọi</p>
        </div>
      </div>
    );
  }

  const selectedScript = scripts.find((s) => s.id === script);

  return (
    <div className="w-[420px] flex-shrink-0 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

      {/* ===== HEADER: Cuộc gọi đang active ===== */}
      <div className={`px-4 py-3 transition-all duration-300 ${
        isCallActive
          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
          : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
      }`}>
        {isCallActive ? (
          <div className="flex items-center gap-3">
            {/* Dot + animation */}
            <div className="relative flex-shrink-0">
              <span className="absolute inset-0 w-4 h-4 bg-green-400 rounded-full animate-ping opacity-75" />
              <span className="relative w-4 h-4 bg-green-300 rounded-full block" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-green-100 uppercase tracking-wider">ĐANG TRONG CUỘC GỌI</p>
              <p className="text-sm font-bold truncate">{lead.name}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[10px] font-semibold text-green-100 uppercase">Thời gian</p>
              <p className="text-2xl font-bold tabular-nums">{formatDuration(callDuration)}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-white text-xs font-bold">{lead.avatar}</span>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-blue-100 uppercase tracking-wider">Thông tin khách hàng</p>
                <p className="text-sm font-bold">{lead.name}</p>
              </div>
            </div>
            <button
              onClick={onStartCall}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 shadow-sm active:scale-95"
            >
              <PhoneCall size={14} />
              Gọi ngay
            </button>
          </div>
        )}
      </div>

      {/* ===== SCROLLABLE CONTENT ===== */}
      <div className="flex-1 overflow-y-auto">

        {/* --- Customer Info Summary (khi KH được chọn, chưa gọi) --- */}
        {!isCallActive && (
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            {/* 4-col info grid */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-white rounded-lg px-3 py-2 border border-gray-100">
                <p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">SĐT</p>
                <a
                  href={`tel:${lead.phone.replace(/\s/g, '')}`}
                  className="text-sm font-bold text-blue-500 hover:text-blue-700 hover:underline"
                >
                  {lead.phone}
                </a>
              </div>
              <div className="bg-white rounded-lg px-3 py-2 border border-gray-100">
                <p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">Dịch vụ</p>
                <p className="text-sm font-semibold text-gray-700">{lead.service}</p>
              </div>
              <div className="bg-white rounded-lg px-3 py-2 border border-gray-100">
                <p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">Lần gọi</p>
                <p className="text-sm font-semibold text-gray-700">{lead.callCount} lần</p>
              </div>
              <div className="bg-white rounded-lg px-3 py-2 border border-gray-100">
                <p className="text-[10px] font-semibold text-gray-400 uppercase mb-0.5">Follow-up</p>
                <p className={`text-sm font-semibold ${lead.followUp === '-' ? 'text-gray-300' : 'text-amber-600'}`}>
                  {lead.followUp === '-' ? '—' : lead.followUp.split(' ')[1]}
                </p>
              </div>
            </div>

            {/* Tags */}
            {lead.tags && lead.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {lead.tags.map((tag) => <TagChip key={tag} label={tag} />)}
              </div>
            )}
          </div>
        )}

        <div className="p-4 space-y-4">

          {/* --- Kịch bản Dropdown --- */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={13} className="text-purple-500" />
              <h3 className="text-xs font-bold text-gray-700">Kịch bản cuộc gọi</h3>
            </div>
            <div className="relative">
              <select
                value={script}
                onChange={(e) => setScript(Number(e.target.value))}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-white cursor-pointer appearance-none pr-8 font-medium"
              >
                <option value="">— Chọn kịch bản —</option>
                {scripts.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            {selectedScript && (
              <div className="mt-2 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                <p className="text-xs text-purple-700 leading-relaxed italic">"{selectedScript.content}"</p>
              </div>
            )}
          </div>

          {/* --- Ghi chú Textarea --- */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <StickyNote size={13} className="text-amber-500" />
              <h3 className="text-xs font-bold text-gray-700">Ghi chú cuộc gọi</h3>
            </div>
            <textarea
              value={callNote}
              onChange={(e) => setCallNote(e.target.value)}
              placeholder="Nhập ghi chú sau cuộc gọi..."
              rows={3}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50 placeholder-gray-400"
            />
          </div>

          {/* --- Kết quả cuộc gọi Radio Buttons --- */}
          <div>
            <h3 className="text-xs font-bold text-gray-700 mb-2">Kết quả cuộc gọi</h3>
            <div className="grid grid-cols-2 gap-2">
              {CALL_RESULTS.map((r) => {
                const Icon = r.icon;
                const isSelected = callResult === r.value;
                return (
                  <label
                    key={r.value}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? `${r.bg} ${r.border} shadow-sm`
                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="callResult"
                      value={r.value}
                      checked={callResult === r.value}
                      onChange={(e) => setCallResult(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected ? `border-2 ${r.dot} border-current` : 'border-gray-300'
                    }`}>
                      {isSelected && <span className={`w-1.5 h-1.5 rounded-full ${r.dot}`} />}
                    </div>
                    <Icon size={13} className={`${r.color} flex-shrink-0`} />
                    <span className={`text-xs font-semibold ${isSelected ? r.color : 'text-gray-500'}`}>
                      {r.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* --- Follow-up + Trạng thái (2 cột) --- */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5 block">
                <Clock size={9} className="inline mr-0.5" /> Follow-up
              </label>
              <input
                type="datetime-local"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5 block">
                <Zap size={9} className="inline mr-0.5" /> Trạng thái Lead
              </label>
              <div className="relative">
                <select
                  value={leadStatus}
                  onChange={(e) => setLeadStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50 cursor-pointer appearance-none pr-6"
                >
                  <option value="">Chọn...</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* --- Lịch sử Timeline --- */}
          {lead.history && lead.history.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-700 mb-2">Lịch sử cuộc gọi</h3>
              <div className="space-y-2.5 relative pl-3">
                {/* Vertical line */}
                <div className="absolute left-[7px] top-1 bottom-3 w-px bg-gray-200" />
                {lead.history.map((entry) => {
                  const resultConfig = CALL_RESULTS.find((r) => r.value === entry.result) || CALL_RESULTS[0];
                  return (
                    <div key={entry.id} className="relative">
                      <div
                        className={`absolute left-[-13px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white ${resultConfig.dot} shadow-sm`}
                      />
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-gray-700">{entry.date}</span>
                            <span className="text-[9px] text-gray-400">{entry.agent}</span>
                          </div>
                          <span className={`text-[10px] font-bold ${resultConfig.color}`}>
                            {entry.result}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-relaxed">{entry.note}</p>
                        <div className="flex items-center gap-1 mt-1.5">
                          <Clock size={9} className="text-gray-400" />
                          <span className="text-[10px] text-gray-400 font-medium">{entry.duration}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== FOOTER: Kết thúc cuộc gọi ===== */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
        <button
          onClick={onEndCall}
          className={`w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg active:scale-[0.98] ${
            isCallActive
              ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-red-200 hover:shadow-red-300'
              : 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-100 cursor-not-allowed shadow-none'
          }`}
          disabled={!isCallActive}
        >
          <PhoneOff size={18} />
          KẾT THÚC CUỘC GỌI
        </button>
        {!isCallActive && (
          <p className="text-center text-[10px] text-gray-400 mt-1.5">
            Nhấn <span className="font-semibold text-gray-500">"Gọi ngay"</span> để bắt đầu cuộc gọi
          </p>
        )}
      </div>
    </div>
  );
}

// ===== MAIN EXPORT =====

export default function TelemarketingPage() {
  const [leads, setLeads] = useState([]);
  const [scripts, setScripts] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callResult, setCallResult] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [leadStatus, setLeadStatus] = useState('');
  const [script, setScript] = useState('');
  const [callNote, setCallNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('Tất cả');
  const [filterService, setFilterService] = useState('Tất cả dịch vụ');
  const [filterPriority, setFilterPriority] = useState('Tất cả');
  const [showFilters, setShowFilters] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();
  const callTimerRef = useRef(null);

  // ===== FETCH DATA =====
  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        // TODO: Replace with actual API endpoints
        // const [leadsRes, scriptsRes] = await Promise.all([
        //   fetch('/api/tele/leads'),
        //   fetch('/api/tele/scripts'),
        // ]);
        // if (!leadsRes.ok) throw new Error('Failed to fetch leads');
        // if (!scriptsRes.ok) throw new Error('Failed to fetch scripts');
        // const leadsData = await leadsRes.json();
        // const scriptsData = await scriptsRes.json();

        // Placeholder: simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        if (!isMounted) return;

        // Set fetched data (use placeholder empty arrays when API not ready)
        setLeads([]);
        setScripts([]);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Đã xảy ra lỗi khi tải dữ liệu');
        toast.error('Không thể tải dữ liệu telemarketing');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeCount = leads.filter((l) => l.status === 'Hoạt động').length;
  const scheduledCount = leads.filter((l) => l.status === 'Giờ hẹn gọi').length;

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery);
    const matchesService = filterService === 'Tất cả dịch vụ' || lead.service === filterService;
    const matchesPriority = filterPriority === 'Tất cả' || lead.priority === filterPriority;
    const matchesStatus = filterStatus === 'Tất cả' || lead.status === filterStatus;
    return matchesSearch && matchesService && matchesPriority && matchesStatus;
  });

  // Format duration
  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Start call
  const handleStartCall = (lead) => {
    setSelectedLead(lead);
    setIsCallActive(true);
    setCallDuration(0);
    setCallResult('');
    setFollowUpDate('');
    setLeadStatus('');
    setScript('');
    setCallNote('');
    callTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    toast.success(`Đang gọi cho ${lead.name}...`);
  };

  // End call
  const handleEndCall = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    setIsCallActive(false);
    // TODO: Save call log to API
    // await fetch('/api/tele/calls', { method: 'POST', body: JSON.stringify({ ... }) });
    if (selectedLead) {
      toast.success(`Đã kết thúc cuộc gọi với ${selectedLead.name}`);
    }
  };

  // Toggle status
  const handleToggleStatus = (leadId) => {
    // TODO: Update lead status via API
    // await fetch(`/api/tele/leads/${leadId}/status`, { method: 'PATCH', body: JSON.stringify({ status: ... }) });
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? { ...l, status: l.status === 'Hoạt động' ? 'Giờ hẹn gọi' : 'Hoạt động' }
          : l
      )
    );
  };

  useEffect(() => {
    return () => { if (callTimerRef.current) clearInterval(callTimerRef.current); };
  }, []);

  return (
    <div className="flex gap-4 h-[calc(100vh-140px)]">

      {/* =============================================
          LEFT: Danh sách Lead + Filter Toolbar
      ============================================= */}
      <div className="flex-1 flex flex-col min-w-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

        {/* ===== TOOLBAR: Tiêu đề + Filter ===== */}
        <div className="px-4 pt-4 pb-0 border-b border-gray-100">
          {/* Row 1: Title + Stats + Buttons */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-sm">
                <Phone size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800">Team Tele</h2>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[10px] font-medium text-gray-400">
                    <span className="text-green-600 font-bold">{activeCount}</span> Hoạt động
                  </span>
                  <span className="text-[10px] font-medium text-gray-400">
                    <span className="text-amber-600 font-bold">{scheduledCount}</span> Hẹn gọi
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-xl transition-colors">
                <Download size={13} />
                Export
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm">
                <Upload size={13} />
                Thêm Lead
              </button>
            </div>
          </div>

          {/* ===== FILTER TOOLBAR ===== */}
          {showFilters && (
            <div className="pb-3 flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative flex-1 min-w-48">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm tên, SĐT..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              {/* Date filter */}
              <div className="relative">
                <Calendar size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all text-gray-600 cursor-pointer"
                />
              </div>

              {/* Status filter */}
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer appearance-none pr-7 text-gray-600"
                >
                  <option>Tất cả</option>
                  <option>Hoạt động</option>
                  <option>Giờ hẹn gọi</option>
                </select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Service filter */}
              <div className="relative">
                <select
                  value={filterService}
                  onChange={(e) => setFilterService(e.target.value)}
                  className="px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer appearance-none pr-7 text-gray-600"
                >
                  {SERVICE_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Priority filter */}
              <div className="relative">
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer appearance-none pr-7 text-gray-600"
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p} value={p}>{p === 'Tất cả' ? 'Tất cả ưu tiên' : p}</option>
                  ))}
                </select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Clear filters */}
              {(searchQuery || filterDate || filterStatus !== 'Tất cả' || filterService !== 'Tất cả dịch vụ' || filterPriority !== 'Tất cả') && (
                <button
                  onClick={() => { setSearchQuery(''); setFilterDate(''); setFilterStatus('Tất cả'); setFilterService('Tất cả dịch vụ'); setFilterPriority('Tất cả'); }}
                  className="flex items-center gap-1 px-2.5 py-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <X size={11} />
                  Xóa lọc
                </button>
              )}
            </div>
          )}

          {/* Toggle filter */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600 mb-2 transition-colors"
          >
            {showFilters ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
          </button>
        </div>

        {/* ===== TABLE ===== */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-gray-50 z-10 border-b border-gray-100">
              <tr className="text-[10px] text-gray-400 uppercase tracking-wider">
                <th className="text-left px-3 py-2.5 font-bold w-12">PRI</th>
                <th className="text-left px-3 py-2.5 font-bold min-w-0">Khách hàng</th>
                <th className="text-left px-3 py-2.5 font-bold">SĐT</th>
                <th className="text-left px-3 py-2.5 font-bold hidden xl:table-cell">Dịch vụ</th>
                <th className="text-center px-3 py-2.5 font-bold">Trạng thái</th>
                <th className="text-left px-3 py-2.5 font-bold hidden lg:table-cell">Follow-up</th>
                <th className="text-center px-3 py-2.5 font-bold w-24">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <LoadingSkeleton />
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <EmptyState message={error} />
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <EmptyState message={leads.length === 0 ? 'Chưa có dữ liệu' : 'Không có lead nào phù hợp'} />
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <LeadRow
                    key={lead.id}
                    lead={lead}
                    isActive={selectedLead?.id === lead.id}
                    onSelect={(l) => setSelectedLead(l)}
                    onToggleStatus={handleToggleStatus}
                    onCall={handleStartCall}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ===== TABLE FOOTER ===== */}
        <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <span className="text-[11px] text-gray-400">
            Hiển thị <span className="font-semibold text-gray-600">{filteredLeads.length}</span> / <span className="font-semibold text-gray-600">{leads.length}</span> khách hàng
          </span>
          <span className="text-[11px] text-gray-400">
            {activeCount} hoạt động · {scheduledCount} hẹn gọi
          </span>
        </div>
      </div>

      {/* =============================================
          RIGHT: Call Panel
      ============================================= */}
      <CallPanel
        lead={selectedLead}
        isCallActive={isCallActive}
        callDuration={callDuration}
        callResult={callResult}
        setCallResult={setCallResult}
        scripts={scripts}
        script={script}
        setScript={setScript}
        callNote={callNote}
        setCallNote={setCallNote}
        followUpDate={followUpDate}
        setFollowUpDate={setFollowUpDate}
        leadStatus={leadStatus}
        setLeadStatus={setLeadStatus}
        onStartCall={() => selectedLead && handleStartCall(selectedLead)}
        onEndCall={handleEndCall}
        formatDuration={formatDuration}
      />
    </div>
  );
}
