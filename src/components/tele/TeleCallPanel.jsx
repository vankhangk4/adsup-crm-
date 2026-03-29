/**
 * TeleCallPanel - Panel cuộc gọi bên phải
 * Chứa: Header cuộc gọi, timeline KH, textarea ghi chú, kịch bản,
 *       radio kết quả, follow-up, cập nhật trạng thái, nút kết thúc
 */
import { Phone, PhoneOff, Clock, Calendar, ChevronDown } from 'lucide-react';

const STATUS_OPTIONS = ['Mới', 'Đang xử lý', 'Thành công', 'Từ chối', 'Chưa liên hệ'];
const CALL_RESULTS = [
  { value: 'answer', label: 'Answer', color: 'text-green-600' },
  { value: 'busy', label: 'Busy', color: 'text-amber-600' },
  { value: 'wrong', label: 'Wrong Number', color: 'text-red-600' },
  { value: 'booked', label: 'Booked', color: 'text-blue-600' },
];

export default function TeleCallPanel({
  lead,
  isCallActive,
  callDuration,
  callResult,
  setCallResult,
  followUpDate,
  setFollowUpDate,
  leadStatus,
  setLeadStatus,
  script,
  setScript,
  callNote,
  setCallNote,
  callHistory,
  callScripts,
  onStartCall,
  onEndCall,
  formatDuration,
}) {
  if (!lead) {
    return (
      <div className="w-96 flex items-center justify-center bg-white rounded-xl border border-gray-200 shadow-sm">
        <p className="text-gray-400 text-sm">Chọn một lead để bắt đầu</p>
      </div>
    );
  }

  return (
    <div className="w-96 flex-shrink-0 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* ===== Panel Header ===== */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        {isCallActive ? (
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            <div className="flex-1">
              <p className="text-xs text-blue-100 font-medium uppercase tracking-wide">
                ĐANG TRONG CUỘC GỌI
              </p>
              <p className="text-sm font-semibold">{lead.name}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-blue-100 font-medium uppercase">Thời gian</p>
              <p className="text-lg font-bold tabular-nums">{formatDuration(callDuration)}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-100 font-medium uppercase tracking-wide">
                THÔNG TIN KHÁCH HÀNG
              </p>
              <p className="text-sm font-semibold mt-0.5">{lead.name}</p>
            </div>
            <button
              onClick={onStartCall}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            >
              <Phone size={14} />
              Gọi ngay
            </button>
          </div>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-5">
          {/* ===== Customer Info Summary ===== */}
          {!isCallActive && (
            <>
              <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">SĐT</span>
                  <span className="text-sm font-medium text-gray-800">{lead.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Dịch vụ</span>
                  <span className="text-xs font-medium text-gray-700 bg-gray-200 px-2 py-0.5 rounded">
                    {lead.service}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Số lần gọi</span>
                  <span className="text-xs font-medium text-gray-800">{lead.callCount} lần</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Ghi chú</span>
                  <span className="text-xs text-gray-600 max-w-[180px] truncate">{lead.note}</span>
                </div>
              </div>

              {/* ===== Call History Timeline ===== */}
              <div>
                <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Lịch sử cuộc gọi
                </h3>
                <div className="space-y-3 relative pl-3">
                  {/* Vertical line */}
                  <div className="absolute left-[7px] top-1 bottom-1 w-px bg-gray-200" />

                  {callHistory.map((entry, idx) => (
                    <div key={entry.id} className="relative">
                      {/* Dot */}
                      <div
                        className={`absolute left-[-12px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                          entry.result === 'Answer'
                            ? 'bg-green-500'
                            : entry.result === 'Busy'
                            ? 'bg-amber-500'
                            : 'bg-gray-400'
                        }`}
                      />
                      <div className="bg-gray-50 rounded-lg p-2.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-700">{entry.date}</span>
                          <span className={`text-[10px] font-semibold ${
                            entry.result === 'Answer'
                              ? 'text-green-600'
                              : entry.result === 'Busy'
                              ? 'text-amber-600'
                              : 'text-gray-500'
                          }`}>
                            {entry.result}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500">{entry.agent}</p>
                        <p className="text-[11px] text-gray-600 mt-1 leading-snug">{entry.note}</p>
                        <div className="flex items-center gap-1 mt-1.5">
                          <Clock size={10} className="text-gray-400" />
                          <span className="text-[10px] text-gray-400">{entry.duration}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ===== Ghi chú từ cuộc gọi ===== */}
          <div>
            <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Ghi chú từ cuộc gọi
            </h3>
            <textarea
              value={callNote}
              onChange={(e) => setCallNote(e.target.value)}
              placeholder="Nhập ghi chú từ cuộc gọi..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
            />
          </div>

          {/* ===== Kịch bản ===== */}
          <div>
            <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Kịch bản
            </h3>
            <div className="relative">
              <select
                value={script}
                onChange={(e) => setScript(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer pr-8"
              >
                <option value="">Chọn kịch bản...</option>
                {callScripts.map((s, i) => (
                  <option key={i} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
            {script && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-700 leading-relaxed">
                  Nội dung kịch bản: {script}. Tư vấn chi tiết về các tính năng và ưu đãi của gói dịch vụ phù hợp với nhu cầu khách hàng.
                </p>
              </div>
            )}
          </div>

          {/* ===== Kết quả cuộc gọi ===== */}
          <div>
            <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Kết quả cuộc gọi
            </h3>
            <div className="space-y-2">
              {CALL_RESULTS.map((r) => (
                <label
                  key={r.value}
                  className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition-all ${
                    callResult === r.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="callResult"
                    value={r.value}
                    checked={callResult === r.value}
                    onChange={(e) => setCallResult(e.value)}
                    className="sr-only"
                  />
                  <span
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      callResult === r.value
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {callResult === r.value && (
                      <span className="w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                  </span>
                  <span className={`text-sm font-medium ${r.color}`}>{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* ===== Follow-up & Trạng thái ===== */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Follow-up
              </h3>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Calendar
                  size={14}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Trạng thái Lead
              </h3>
              <div className="relative">
                <select
                  value={leadStatus}
                  onChange={(e) => setLeadStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer pr-8"
                >
                  <option value="">Chọn...</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Bottom: End Call Button ===== */}
      {isCallActive && (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onEndCall}
            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 shadow-sm active:scale-[0.98]"
          >
            <PhoneOff size={16} />
            KẾT THÚC CUỘC GỌI
          </button>
        </div>
      )}
    </div>
  );
}
