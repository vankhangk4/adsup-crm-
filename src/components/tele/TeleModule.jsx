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
import { TableSkeleton } from '../common/SkeletonLoader';
import { useToast } from '../../contexts/ToastContext';
import * as teleService from '../../services/teleService';


export default function TeleModule() {
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'scheduled'
  const [selectedLead, setSelectedLead] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const toast = useToast();

  // Fetch tele leads from API
  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        const res = await teleService.listLeads({ page_size: 100 });
        const leadsData = res?.data?.items || res?.data || res || [];

        const normalized = leadsData.map((l) => ({
          id: l.id,
          name: l.customer_name || l.external_customer_id || `Lead #${l.id}`,
          phone: l.phone || '',
          service: l.service_name || '',
          status: l.lead_status_code === 'new' || l.lead_status_code === 'qualified' ? 'Hoạt động' : 'Giờ hẹn gọi',
          priority: l.interest_level === 'high' ? 'Cao' : l.interest_level === 'medium' ? 'Trung bình' : 'Thấp',
          followUp: l.next_follow_up || '-',
          lastCall: l.last_call || '-',
          callCount: l.call_count || 0,
          note: l.note_tele || l.note_page || '',
          avatar: (l.customer_name || 'L').substring(0, 3).toUpperCase(),
        }));

        if (isMounted) {
          setLeads(normalized);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setIsLoading(false);
        }
        console.error('Failed to fetch tele leads:', err);
      }
    }

    fetchData();
    return () => { isMounted = false; };
  }, []);
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
    toast.success(`Đang gọi cho ${lead.name}...`);
  };

  const handleEndCall = async () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    const prevLead = selectedLead;
    const prevDuration = callDuration;
    const prevResult = callResult;
    const prevNote = callNote;
    setIsCallActive(false);

    if (prevLead) {
      // Optimistic update
      setLeads((prev) =>
        prev.map((l) =>
          l.id === prevLead.id
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
      toast.success(`Đã kết thúc cuộc gọi với ${prevLead.name}`);

      try {
        await teleService.addCallLog(prevLead.id, {
          result: prevResult,
          duration: prevDuration,
          note: prevNote,
        });
        if (leadStatus) {
          const statusMap = {
            'Hoạt động': 'qualified',
            'Giờ hẹn gọi': 'scheduled',
          };
          await teleService.updateStatus(prevLead.id, statusMap[leadStatus] || 'new');
        }
      } catch (err) {
        console.error('Failed to save call log:', err);
      }
    }
  };

  const handleToggleStatus = async (leadId) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;
    const newStatus = lead.status === 'Hoạt động' ? 'Giờ hẹn gọi' : 'Hoạt động';
    const statusMap = {
      'Hoạt động': 'qualified',
      'Giờ hẹn gọi': 'scheduled',
    };
    // Optimistic update
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId ? { ...l, status: newStatus } : l
      )
    );
    try {
      await teleService.updateStatus(leadId, statusMap[newStatus]);
    } catch (err) {
      // Revert on failure
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId ? { ...l, status: lead.status } : l
        )
      );
      toast.error('Lỗi khi cập nhật trạng thái');
    }
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
          {isLoading ? (
            <TableSkeleton rows={6} cols={7} />
          ) : (
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
          )}
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
        onStartCall={() => handleStartCall(selectedLead)}
        onEndCall={handleEndCall}
        formatDuration={formatDuration}
      />
    </div>
  );
}
