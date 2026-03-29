/**
 * RoutingModule - Trang Mô đun 7: Routing Lead
 * Bố cục: 2 cột
 *  - Cột trái: Quy tắc Routing + Trình xây dựng quy tắc IF/THEN
 *  - Cột phải: Quản lý nhóm Tele & Hàng chờ
 */
import { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  X,
  Check,
  ArrowDown,
  Users,
  Clock,
  User,
  TrendingUp,
  Activity,
  Layers,
  Zap,
} from 'lucide-react';
import PrimaryButton from '../common/PrimaryButton';

// ===== MOCK DATA =====

const routingRulesInit = [
  {
    id: 1,
    name: 'Quy tắc 1',
    status: true,
    conditions: [
      { field: 'Nguồn Lead', operator: '=', value: 'Facebook' },
    ],
    actions: [{ type: 'assign_group', value: 'Nhóm Tele A' }],
  },
  {
    id: 2,
    name: 'Quy tắc 2',
    status: true,
    conditions: [
      { field: 'Dịch vụ', operator: '=', value: 'Internet FPT' },
    ],
    actions: [{ type: 'assign_agent', value: 'Nguyễn Thu Hà' }],
  },
  {
    id: 3,
    name: 'Quy tắc 3',
    status: false,
    conditions: [
      { field: 'Giờ Lead', operator: 'between', value: '08:00 - 17:00' },
    ],
    actions: [{ type: 'assign_group', value: 'Nhóm Tele B' }],
  },
  {
    id: 4,
    name: 'Quy tắc 4',
    status: true,
    conditions: [
      { field: 'Tỉnh/TP', operator: '=', value: 'Hồ Chí Minh' },
    ],
    actions: [{ type: 'mark_priority', value: 'Cao' }],
  },
];

const teleGroupsInit = [
  {
    id: 1,
    name: 'Nhóm Tele A',
    seniority: 'Senior',
    capacity: 20,
    current: 15,
    agents: [
      { id: 1, name: 'Nguyễn Thu Hà', avatar: 'NH', status: 'online' },
      { id: 2, name: 'Lê Minh Tuấn', avatar: 'LT', status: 'online' },
      { id: 3, name: 'Trần Văn Đạt', avatar: 'TD', status: 'busy' },
      { id: 4, name: 'Phạm Thị Mai', avatar: 'PM', status: 'online' },
      { id: 5, name: 'Hoàng Văn Bảo', avatar: 'HB', status: 'offline' },
    ],
  },
  {
    id: 2,
    name: 'Nhóm Tele B',
    seniority: 'Junior',
    capacity: 15,
    current: 8,
    agents: [
      { id: 6, name: 'Vũ Minh Đức', avatar: 'VD', status: 'online' },
      { id: 7, name: 'Đặng Thu Hà', avatar: 'DH', status: 'online' },
      { id: 8, name: 'Bùi Thị Lan', avatar: 'BL', status: 'offline' },
      { id: 9, name: 'Lê Quang Huy', avatar: 'LH', status: 'busy' },
    ],
  },
  {
    id: 3,
    name: 'Nhóm Tele C',
    seniority: 'Lead',
    capacity: 10,
    current: 10,
    agents: [
      { id: 10, name: 'Phạm Đức Cường', avatar: 'PC', status: 'busy' },
      { id: 11, name: 'Hoàng Thị Dung', avatar: 'HD', status: 'online' },
    ],
  },
];

const queueDataInit = [
  { id: 'LD001', waitTime: '00:45' },
  { id: 'LD002', waitTime: '02:30' },
  { id: 'LD003', waitTime: '05:15' },
  { id: 'LD004', waitTime: '00:10' },
  { id: 'LD005', waitTime: '01:20' },
];

const FIELD_OPTIONS = {
  'Nguồn Lead': ['Facebook', 'Website', 'Google Ads', 'Zalo', 'Giới thiệu', 'Hotline'],
  'Dịch vụ': ['Internet FPT', 'Truyền hình FPT', 'Camera AI', 'FPT Play Box'],
  'Giờ Lead': ['08:00 - 12:00', '12:00 - 17:00', '17:00 - 20:00'],
  'Tỉnh/TP': ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ'],
  'Mức độ ưu tiên': ['Cao', 'Trung bình', 'Thấp'],
};

const ACTION_OPTIONS = [
  { type: 'assign_group', label: 'Gán cho nhóm Tele' },
  { type: 'assign_agent', label: 'Gán cho Agent' },
  { type: 'mark_priority', label: 'Đánh dấu ưu tiên' },
];

const GROUP_OPTIONS = ['Nhóm Tele A', 'Nhóm Tele B', 'Nhóm Tele C'];
const AGENT_OPTIONS = [
  'Nguyễn Thu Hà', 'Lê Minh Tuấn', 'Trần Văn Đạt', 'Phạm Thị Mai',
  'Hoàng Văn Bảo', 'Vũ Minh Đức', 'Đặng Thu Hà', 'Bùi Thị Lan',
];
const PRIORITY_OPTIONS = ['Cao', 'Trung bình', 'Thấp'];

// ===== SUB-COMPONENTS =====

function RuleBuilder({ rule, onSave, onCancel, isNew }) {
  const [name, setName] = useState(rule.name);
  const [conditions, setConditions] = useState(rule.conditions);
  const [actions, setActions] = useState(rule.actions);
  const [showFieldDropdown, setShowFieldDropdown] = useState(null);
  const [showValueDropdown, setShowValueDropdown] = useState(null);
  const [showActionDropdown, setShowActionDropdown] = useState(null);
  const [showTargetDropdown, setShowTargetDropdown] = useState(null);

  const addCondition = () => {
    setConditions([...conditions, { field: '', operator: '=', value: '' }]);
  };

  const removeCondition = (idx) => {
    setConditions(conditions.filter((_, i) => i !== idx));
  };

  const updateCondition = (idx, key, val) => {
    const updated = [...conditions];
    updated[idx] = { ...updated[idx], [key]: val };
    if (key === 'field') updated[idx].value = '';
    setConditions(updated);
  };

  const addAction = () => {
    setActions([...actions, { type: '', value: '' }]);
  };

  const removeAction = (idx) => {
    setActions(actions.filter((_, i) => i !== idx));
  };

  const updateAction = (idx, key, val) => {
    const updated = [...actions];
    updated[idx] = { ...updated[idx], [key]: val };
    if (key === 'type') updated[idx].value = '';
    setActions(updated);
  };

  const getTargetOptions = (actionType) => {
    if (actionType === 'assign_group') return GROUP_OPTIONS;
    if (actionType === 'assign_agent') return AGENT_OPTIONS;
    if (actionType === 'mark_priority') return PRIORITY_OPTIONS;
    return [];
  };

  const getActionLabel = (actionType) => {
    return ACTION_OPTIONS.find((a) => a.type === actionType)?.label || '';
  };

  const handleSave = () => {
    if (!name.trim() || conditions.some((c) => !c.field || !c.value) || actions.some((a) => !a.type || !a.value)) return;
    onSave({ ...rule, name, conditions, actions });
  };

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          {isNew ? 'Tạo quy tắc mới' : 'Chỉnh sửa quy tắc'}
        </h3>
        <button onClick={onCancel} className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>

      {/* Tên quy tắc */}
      <div>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tên quy tắc</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nhập tên quy tắc..."
          className="input-field mt-1 text-sm"
        />
      </div>

      {/* ===== IF BLOCK ===== */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-500 text-white text-xs font-semibold rounded-lg">
            <Zap size={12} />
            IF
          </span>
          <span className="text-xs text-gray-500">Thỏa mãn điều kiện</span>
        </div>
        <div className="space-y-2">
          {conditions.map((cond, idx) => (
            <div key={idx}>
              {idx > 0 && (
                <div className="flex items-center gap-2 py-1">
                  <div className="flex-1 h-px bg-blue-200" />
                  <span className="text-xs font-medium text-blue-500 bg-blue-50 px-2 py-0.5 rounded">OR</span>
                  <div className="flex-1 h-px bg-blue-200" />
                </div>
              )}
              <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-2">
                {/* Field selector */}
                <div className="relative flex-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowFieldDropdown(showFieldDropdown === idx ? null : idx);
                      setShowValueDropdown(null);
                    }}
                    className="w-full flex items-center justify-between px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <span className={cond.field ? 'text-gray-800' : 'text-gray-400'}>
                      {cond.field || 'Chọn trường...'}
                    </span>
                    <ChevronDown size={12} className="text-gray-400" />
                  </button>
                  {showFieldDropdown === idx && (
                    <div className="absolute z-20 top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-1 max-h-40 overflow-y-auto">
                      {Object.keys(FIELD_OPTIONS).map((f) => (
                        <button
                          key={f}
                          onClick={() => {
                            updateCondition(idx, 'field', f);
                            setShowFieldDropdown(null);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Operator */}
                <span className="text-xs text-gray-400 font-medium px-1">=</span>

                {/* Value selector */}
                <div className="relative flex-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (!cond.field) return;
                      setShowValueDropdown(showValueDropdown === idx ? null : idx);
                    }}
                    disabled={!cond.field}
                    className="w-full flex items-center justify-between px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className={cond.value ? 'text-gray-800' : 'text-gray-400'}>
                      {cond.value || 'Chọn giá trị...'}
                    </span>
                    <ChevronDown size={12} className="text-gray-400" />
                  </button>
                  {showValueDropdown === idx && cond.field && (
                    <div className="absolute z-20 top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-1 max-h-40 overflow-y-auto">
                      {(FIELD_OPTIONS[cond.field] || []).map((v) => (
                        <button
                          key={v}
                          onClick={() => {
                            updateCondition(idx, 'value', v);
                            setShowValueDropdown(null);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeCondition(idx)}
                  className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={addCondition}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Plus size={12} />
            Thêm điều kiện
          </button>
        </div>
      </div>

      {/* ===== Arrow connector ===== */}
      <div className="flex justify-center">
        <div className="flex flex-col items-center">
          <div className="w-px h-6 bg-gradient-to-b from-blue-300 to-green-300" />
          <ArrowDown size={16} className="text-green-500 -mt-1" />
        </div>
      </div>

      {/* ===== THEN BLOCK ===== */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-500 text-white text-xs font-semibold rounded-lg">
            <Check size={12} />
            THEN
          </span>
          <span className="text-xs text-gray-500">Thực hiện hành động</span>
        </div>
        <div className="space-y-2">
          {actions.map((action, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-2">
              {/* Action type */}
              <div className="relative flex-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowActionDropdown(showActionDropdown === idx ? null : idx);
                    setShowTargetDropdown(null);
                  }}
                  className="w-full flex items-center justify-between px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <span className={action.type ? 'text-gray-800' : 'text-gray-400'}>
                    {action.type ? getActionLabel(action.type) : 'Chọn hành động...'}
                  </span>
                  <ChevronDown size={12} className="text-gray-400" />
                </button>
                {showActionDropdown === idx && (
                  <div className="absolute z-20 top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                    {ACTION_OPTIONS.map((opt) => (
                      <button
                        key={opt.type}
                        onClick={() => {
                          updateAction(idx, 'type', opt.type);
                          setShowActionDropdown(null);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-green-50 hover:text-green-600"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Target value */}
              <span className="text-xs text-gray-400 font-medium px-1">→</span>
              <div className="relative flex-1">
                <button
                  type="button"
                  onClick={() => {
                    if (!action.type) return;
                    setShowTargetDropdown(showTargetDropdown === idx ? null : idx);
                  }}
                  disabled={!action.type}
                  className="w-full flex items-center justify-between px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className={action.value ? 'text-gray-800' : 'text-gray-400'}>
                    {action.value || 'Chọn...'}
                  </span>
                  <ChevronDown size={12} className="text-gray-400" />
                </button>
                {showTargetDropdown === idx && action.type && (
                  <div className="absolute z-20 top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-1 max-h-40 overflow-y-auto">
                    {getTargetOptions(action.type).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          updateAction(idx, 'value', opt);
                          setShowTargetDropdown(null);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-green-50 hover:text-green-600"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => removeAction(idx)}
                className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <button
            onClick={addAction}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-green-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          >
            <Plus size={12} />
            Thêm hành động
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
        <button onClick={onCancel} className="px-4 py-2 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          Hủy
        </button>
        <PrimaryButton size="sm" onClick={handleSave}>
          <Check size={14} />
          Lưu quy tắc
        </PrimaryButton>
      </div>
    </div>
  );
}

function TeleGroupCard({ group }) {
  const usage = Math.round((group.current / group.capacity) * 100);
  const usageColor = usage >= 90 ? 'bg-red-500' : usage >= 70 ? 'bg-amber-500' : 'bg-green-500';

  const statusColors = {
    online: 'bg-green-500',
    busy: 'bg-amber-500',
    offline: 'bg-gray-300',
  };

  const seniorityColors = {
    Senior: 'bg-purple-100 text-purple-700',
    Junior: 'bg-blue-100 text-blue-700',
    Lead: 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-200 hover:shadow-sm transition-all">
      {/* Group header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
            <Users size={14} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-800">{group.name}</span>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${seniorityColors[group.seniority] || 'bg-gray-100 text-gray-600'}`}>
          {group.seniority}
        </span>
      </div>

      {/* Capacity bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
          <span>Công suất</span>
          <span className="font-medium text-gray-700">{group.current}/{group.capacity}</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${usageColor}`}
            style={{ width: `${usage}%` }}
          />
        </div>
      </div>

      {/* Agent avatars */}
      <div className="flex items-center gap-1 flex-wrap">
        {group.agents.map((agent) => (
          <div
            key={agent.id}
            className="relative group/agent"
            title={`${agent.name} (${agent.status})`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white transition-transform hover:scale-110 cursor-default ${
              agent.status === 'offline' ? 'bg-gray-300' :
              agent.status === 'busy' ? 'bg-amber-400' : 'bg-blue-500'
            }`}>
              {agent.avatar}
            </div>
            {/* Status dot */}
            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${statusColors[agent.status]}`} />
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover/agent:opacity-100 pointer-events-none transition-opacity z-10">
              {agent.name}
              <div className={`text-[10px] ${agent.status === 'online' ? 'text-green-300' : agent.status === 'busy' ? 'text-amber-300' : 'text-gray-400'}`}>
                {agent.status === 'online' ? 'Trực tuyến' : agent.status === 'busy' ? 'Bận' : 'Offline'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QueueTable({ data }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-blue-500" />
          <h3 className="text-sm font-semibold text-gray-800">Theo dõi hàng chờ trực tuyến</h3>
          <span className="ml-auto text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
            {data.length} đang chờ
          </span>
        </div>
      </div>
      <div className="overflow-y-auto max-h-48">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr className="text-xs text-gray-500 uppercase tracking-wide">
              <th className="text-left px-4 py-2 font-semibold">Lead ID</th>
              <th className="text-left px-4 py-2 font-semibold">Thời gian chờ</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => {
              const waitMin = parseInt(item.waitTime.split(':')[0]);
              const waitSec = parseInt(item.waitTime.split(':')[1]);
              const isUrgent = waitMin >= 5;
              const isWarning = waitMin >= 2 && waitMin < 5;
              return (
                <tr key={idx} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2.5">
                    <span className="text-xs font-mono font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                      {item.id}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className={isUrgent ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-gray-400'} />
                      <span className={`text-xs font-medium ${
                        isUrgent ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-gray-600'
                      }`}>
                        {item.waitTime}
                      </span>
                      {isUrgent && (
                        <span className="text-[10px] font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded animate-pulse">
                          Khẩn
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RuleTable({ rules, onToggle, onEdit, onDelete, onAddNew }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-blue-500" />
          <h3 className="text-sm font-semibold text-gray-800">Danh sách quy tắc</h3>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{rules.length} quy tắc</span>
        </div>
        <PrimaryButton icon={Plus} size="sm" onClick={onAddNew}>
          Thêm quy tắc
        </PrimaryButton>
      </div>
      <div className="overflow-y-auto max-h-48">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr className="text-xs text-gray-500 uppercase tracking-wide">
              <th className="text-left px-4 py-2 font-semibold w-10">STT</th>
              <th className="text-left px-3 py-2 font-semibold">Tên quy tắc</th>
              <th className="text-center px-3 py-2 font-semibold w-24">Trạng thái</th>
              <th className="text-center px-3 py-2 font-semibold w-28">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule, idx) => (
              <tr
                key={rule.id}
                className="border-t border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 text-xs text-gray-400">{idx + 1}</td>
                <td className="px-3 py-3">
                  <div>
                    <span className="text-sm font-medium text-gray-800">{rule.name}</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      {rule.conditions.slice(0, 2).map((c, ci) => (
                        <span key={ci} className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                          {c.field}: {c.value}
                        </span>
                      ))}
                      {rule.conditions.length > 2 && (
                        <span className="text-[10px] text-gray-400">+{rule.conditions.length - 2}</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-center">
                  <button
                    onClick={() => onToggle(rule.id)}
                    className="inline-flex items-center gap-1.5"
                    title={rule.status ? 'Bật' : 'Tắt'}
                  >
                    {rule.status ? (
                      <ToggleRight size={24} className="text-green-500" />
                    ) : (
                      <ToggleLeft size={24} className="text-gray-300" />
                    )}
                    <span className={`text-xs font-medium ${rule.status ? 'text-green-600' : 'text-gray-400'}`}>
                      {rule.status ? 'Bật' : 'Tắt'}
                    </span>
                  </button>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onEdit(rule)}
                      className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors"
                      title="Sửa"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(rule.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                      title="Xóa"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ===== MAIN COMPONENT =====

export default function RoutingModule() {
  const [rules, setRules] = useState(routingRulesInit);
  const [teleGroups] = useState(teleGroupsInit);
  const [queueData] = useState(queueDataInit);
  const [editingRule, setEditingRule] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleToggleRule = (ruleId) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, status: !r.status } : r))
    );
  };

  const handleDeleteRule = (ruleId) => {
    setRules((prev) => prev.filter((r) => r.id !== ruleId));
  };

  const handleSaveRule = (savedRule) => {
    if (editingRule && !isCreating) {
      setRules((prev) => prev.map((r) => (r.id === savedRule.id ? savedRule : r)));
    } else {
      const newRule = { ...savedRule, id: Date.now() };
      setRules((prev) => [...prev, newRule]);
    }
    setEditingRule(null);
    setIsCreating(false);
  };

  const handleAddNew = () => {
    setEditingRule({ name: '', conditions: [], actions: [] });
    setIsCreating(true);
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setIsCreating(false);
  };

  const handleCancelEdit = () => {
    setEditingRule(null);
    setIsCreating(false);
  };

  // Stats
  const activeRules = rules.filter((r) => r.status).length;
  const totalCapacity = teleGroups.reduce((sum, g) => sum + g.capacity, 0);
  const currentLoad = teleGroups.reduce((sum, g) => sum + g.current, 0);
  const onlineAgents = teleGroups.reduce((sum, g) => sum + g.agents.filter((a) => a.status === 'online').length, 0);
  const busyAgents = teleGroups.reduce((sum, g) => sum + g.agents.filter((a) => a.status === 'busy').length, 0);

  return (
    <div className="flex gap-4 h-[calc(100vh-140px)]">
      {/* ===== LEFT COLUMN: Quy tắc Routing ===== */}
      <div className="flex-1 flex flex-col min-w-0 gap-4 overflow-y-auto">
        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <Layers size={16} className="text-blue-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800">{activeRules}/{rules.length}</p>
              <p className="text-[11px] text-gray-400">Quy tắc đang bật</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
              <TrendingUp size={16} className="text-green-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800">{currentLoad}/{totalCapacity}</p>
              <p className="text-[11px] text-gray-400">Lead đang xử lý</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
              <Users size={16} className="text-purple-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800">{onlineAgents} online</p>
              <p className="text-[11px] text-gray-400">{busyAgents} đang bận</p>
            </div>
          </div>
        </div>

        {/* Rule table */}
        <RuleTable
          rules={rules}
          onToggle={handleToggleRule}
          onEdit={handleEdit}
          onDelete={handleDeleteRule}
          onAddNew={handleAddNew}
        />

        {/* Rule builder */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={14} className="text-blue-500" />
            <h3 className="text-sm font-semibold text-gray-800">Trình xây dựng quy tắc phân phối</h3>
          </div>

          {editingRule !== null ? (
            <RuleBuilder
              rule={editingRule}
              onSave={handleSaveRule}
              onCancel={handleCancelEdit}
              isNew={isCreating}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-3">
                <Zap size={24} className="text-blue-300" />
              </div>
              <p className="text-sm font-medium text-gray-500 mb-1">Chưa có quy tắc nào được chọn</p>
              <p className="text-xs text-gray-400 mb-4">Chọn một quy tắc để chỉnh sửa hoặc tạo mới</p>
              <PrimaryButton icon={Plus} size="sm" onClick={handleAddNew}>
                Tạo quy tắc mới
              </PrimaryButton>
            </div>
          )}
        </div>
      </div>

      {/* ===== RIGHT COLUMN: Quản lý nhóm & Hàng chờ ===== */}
      <div className="w-80 flex-shrink-0 flex flex-col gap-4 overflow-y-auto">
        {/* Group management */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-4">
            <User size={14} className="text-blue-500" />
            <h3 className="text-sm font-semibold text-gray-800">Quản lý nhóm Tele & Công suất</h3>
          </div>
          <div className="space-y-3">
            {teleGroups.map((group) => (
              <TeleGroupCard key={group.id} group={group} />
            ))}
          </div>
        </div>

        {/* Queue */}
        <QueueTable data={queueData} />
      </div>
    </div>
  );
}
