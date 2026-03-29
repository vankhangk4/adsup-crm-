/**
 * TeleModule - Trang Telemarketing (Module 8)
 * Bố cục: 2 cột - Danh sách Lead (trái) + Panel cuộc gọi (phải)
 */
import { useState, useEffect, useRef } from 'react';
import { Phone, Edit2, Trash2, Search, Filter, Plus, ArrowUpRight, Clock, X } from 'lucide-react';
import BadgeStatus from '../common/BadgeStatus';
import SearchInput from '../common/SearchInput';
import PrimaryButton from '../common/PrimaryButton';
import TeleCallPanel from './TeleCallPanel';

// ===== MOCK DATA =====
const teleLeadsData = [
  {
    id: 1,
    name: 'Trần Bình Minh',
    phone: '0903 456 789',
    service: 'Internet FPT',
    status: 'Hoạt động',
    priority: 'Cao',
    followUp: '2026-03-29 14:00',
    lastCall: '2026-03-28 10:30',
    callCount: 3,
    note: 'Khách hàng tiềm năng cao, quan tâm gói Enterprise',
    avatar: 'TBM',
  },
  {
    id: 2,
    name: 'Nguyễn Hoàng Nam',
    phone: '0912 334 455',
    service: 'Truyền hình FPT',
    status: 'Hoạt động',
    priority: 'Trung bình',
    followUp: '2026-03-29 16:30',
    lastCall: '2026-03-27 15:00',
    callCount: 2,
    note: 'Đang xem xét báo giá',
    avatar: 'NHN',
  },
  {
    id: 3,
    name: 'Lê Thị Oanh',
    phone: '0934 556 677',
    service: 'Camera AI',
    status: 'Giờ hẹn gọi',
    priority: 'Cao',
    followUp: '2026-03-29 11:00',
    lastCall: '2026-03-26 09:15',
    callCount: 1,
    note: 'Hẹn gọi lại để tư vấn chi tiết',
    avatar: 'LTO',
  },
  {
    id: 4,
    name: 'Phạm Văn Phong',
    phone: '0945 667 788',
    service: 'Internet FPT',
    status: 'Hoạt động',
    priority: 'Thấp',
    followUp: '-',
    lastCall: '2026-03-25 14:00',
    callCount: 1,
    note: 'Không quan tâm dịch vụ hiện tại',
    avatar: 'PVP',
  },
  {
    id: 5,
    name: 'Hoàng Thu Trang',
    phone: '0967 788 899',
    service: 'FPT Play Box',
    status: 'Giờ hẹn gọi',
    priority: 'Trung bình',
    followUp: '2026-03-30 09:00',
    lastCall: '2026-03-28 11:45',
    callCount: 4,
    note: 'Cần follow-up sau khi test dịch vụ',
    avatar: 'HTT',
  },
];

// Kịch bản gọi
const callScripts = [
  'Kịch bản chào hàng - Internet',
  'Kịch bản chào hàng - Truyền hình',
  'Kịch bản chào hàng - Camera',
  'Kịch bản chăm sóc khách hàng',
  'Kịch bản upsell dịch vụ',
];

// Lịch sử cuộc gọi mẫu
const callHistory = [
  { id: 1, date: '2026-03-28 10:30', duration: '5m 23s', result: 'Answer', agent: 'Nguyễn Thu Hà', note: 'Khách hàng hẹn gọi lại vào 14h' },
  { id: 2, date: '2026-03-27 09:00', duration: '2m 10s', result: 'Busy', agent: 'Nguyễn Thu Hà', note: 'Máy bận, gọi lại sau' },
  { id: 3, date: '2026-03-26 14:30', duration: '8m 45s', result: 'Answer', agent: 'Lê Minh Tuấn', note: 'Tư vấn về gói Premium, cần báo giá' },
];

export default function TeleModule() {
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'scheduled'
  const [selectedLead, setSelectedLead] = useState(teleLeadsData[0]);
  const [isCallActive, setIsCallActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [leads, setLeads] = useState(teleLeadsData);
  const [callDuration, setCallDuration] = useState(0);
  const [callResult, setCallResult] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [leadStatus, setLeadStatus] = useState('');
  const [script, setScript] = useState('');
  const [callNote, setCallNote] = useState('');
  const callTimerRef = useRef(null);

  // Filter leads by tab
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery);
    const matchesTab =
      activeTab === 'active'
        ? lead.status === 'Hoạt động'
        : lead.status === 'Giờ hẹn gọi';
    return matchesSearch && matchesTab;
  });

  const handleStartCall = (lead) => {
    setSelectedLead(lead);
    setIsCallActive(true);
    setCallDuration(0);
    setCallResult('');
    setFollowUpDate('');
    setLeadStatus('');
    setScript('');
    setCallNote('');

    // Start timer
    callTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  const handleEndCall = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    setIsCallActive(false);

    // Update lead in list
    setLeads((prev) =>
      prev.map((l) =>
        l.id === selectedLead.id
          ? {
              ...l,
              lastCall: new Date().toLocaleString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              }),
              callCount: l.callCount + 1,
              status: leadStatus || l.status,
              note: callNote || l.note,
            }
          : l
      )
    );
  };

  const handleToggleStatus = (leadId) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
              ...l,
              status: l.status === 'Hoạt động' ? 'Giờ hẹn gọi' : 'Hoạt động',
            }
          : l
      )
    );
  };

  useEffect(() => {
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, []);

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-140px)]">
      {/* ===== LEFT: Lead List ===== */}
      <div className="flex-1 flex flex-col min-w-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900">Danh sách Lead</h2>
            <PrimaryButton icon={Plus} size="sm">
              Thêm Lead
            </PrimaryButton>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all duration-150 ${
                activeTab === 'active'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Hoạt động ({leads.filter((l) => l.status === 'Hoạt động').length})
            </button>
            <button
              onClick={() => setActiveTab('scheduled')}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all duration-150 ${
                activeTab === 'scheduled'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Giờ hẹn gọi ({leads.filter((l) => l.status === 'Giờ hẹn gọi').length})
            </button>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-2 mt-3">
            <div className="flex-1">
              <SearchInput
                placeholder="Tìm theo tên hoặc SĐT..."
                value={searchQuery}
                onChange={setSearchQuery}
                debounceMs={0}
                size="sm"
              />
            </div>
            <button className="btn-secondary text-xs py-1.5 px-3">
              <Filter size={14} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-gray-50 z-10">
              <tr className="text-xs text-gray-500 uppercase tracking-wider">
                <th className="text-left px-4 py-2 font-semibold w-12">PRI</th>
                <th className="text-left px-3 py-2 font-semibold">Khách hàng</th>
                <th className="text-left px-3 py-2 font-semibold hidden md:table-cell">SĐT</th>
                <th className="text-left px-3 py-2 font-semibold hidden lg:table-cell">Dịch vụ</th>
                <th className="text-center px-3 py-2 font-semibold w-28">Trạng thái</th>
                <th className="text-left px-3 py-2 font-semibold hidden sm:table-cell">Follow-up</th>
                <th className="text-center px-3 py-2 font-semibold w-24">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  className={`border-b border-gray-50 hover:bg-blue-50/30 cursor-pointer transition-colors ${
                    selectedLead?.id === lead.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedLead(lead)}
                >
                  {/* Priority */}
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded ${
                        lead.priority === 'Cao'
                          ? 'bg-red-100 text-red-600'
                          : lead.priority === 'Trung bình'
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-green-100 text-green-600'
                      }`}
                    >
                      {lead.priority === 'Cao' ? '!' : lead.priority === 'Trung bình' ? '~' : '↓'}
                    </span>
                  </td>

                  {/* Name */}
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-[10px] font-bold">{lead.avatar}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{lead.name}</p>
                        <p className="text-xs text-gray-400 md:hidden">{lead.phone}</p>
                      </div>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="px-3 py-3 hidden md:table-cell">
                    <span className="text-sm text-gray-700">{lead.phone}</span>
                  </td>

                  {/* Service */}
                  <td className="px-3 py-3 hidden lg:table-cell">
                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {lead.service}
                    </span>
                  </td>

                  {/* Status Toggle */}
                  <td className="px-3 py-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(lead.id);
                      }}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                        lead.status === 'Hoạt động'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          lead.status === 'Hoạt động' ? 'bg-green-500' : 'bg-amber-500'
                        }`}
                      />
                      {lead.status === 'Hoạt động' ? 'Bật' : 'Hẹn'}
                    </button>
                  </td>

                  {/* Follow-up */}
                  <td className="px-3 py-3 hidden sm:table-cell">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock size={12} className="text-gray-400" />
                      <span className={lead.followUp === '-' ? 'text-gray-400' : ''}>
                        {lead.followUp !== '-' ? lead.followUp.split(' ')[1] : '-'}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartCall(lead);
                        }}
                        className="p-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                        title="Gọi"
                      >
                        <Phone size={14} />
                      </button>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
                        title="Sửa"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-500 transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">
                    Không có lead nào phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== RIGHT: Call Panel ===== */}
      <TeleCallPanel
        lead={selectedLead}
        isCallActive={isCallActive}
        callDuration={callDuration}
        callResult={callResult}
        setCallResult={setCallResult}
        followUpDate={followUpDate}
        setFollowUpDate={setFollowUpDate}
        leadStatus={leadStatus}
        setLeadStatus={setLeadStatus}
        script={script}
        setScript={setScript}
        callNote={callNote}
        setCallNote={setCallNote}
        callHistory={callHistory}
        callScripts={callScripts}
        onStartCall={() => handleStartCall(selectedLead)}
        onEndCall={handleEndCall}
        formatDuration={formatDuration}
      />
    </div>
  );
}
