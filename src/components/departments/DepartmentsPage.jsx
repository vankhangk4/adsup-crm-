/**
 * DepartmentsPage - Trang Quản lý Phòng ban
 * Route: /departments
 * Bố cục: Grid cards cho từng phòng ban
 */
import { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Users,
  UserCheck,
  MoreHorizontal,
  Building2,
  Headphones,
  Megaphone,
  Wrench,
  Briefcase,
  Heart,
  FileText,
} from 'lucide-react';
import PrimaryButton from '../common/PrimaryButton';
import { departmentsData } from '../../data/mockDepartmentData';

// ===== SUB-COMPONENTS =====

const DEPT_ICONS = {
  Consultant: Headphones,
  TelesalesA: Users,
  TelesalesB: Users,
  Marketing: Megaphone,
  'Kỹ thuật': Wrench,
  Kinhdoanh: Briefcase,
  'Chăm sóc KH': Heart,
  'Hành chính': FileText,
};

function DepartmentCard({ dept }) {
  const Icon = DEPT_ICONS[dept.shortName] || Building2;
  const MAX_AVATARS = 5;
  const displayMembers = dept.members.slice(0, MAX_AVATARS);
  const remaining = dept.memberCount - MAX_AVATARS;

  const statusColors = {
    online: 'bg-green-500',
    busy: 'bg-amber-500',
    offline: 'bg-gray-300',
  };
  const statusLabels = {
    online: 'Online',
    busy: 'Bận',
    offline: 'Offline',
  };

  const onlineCount = dept.members.filter((m) => m.status === 'online').length;
  const busyCount = dept.members.filter((m) => m.status === 'busy').length;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-blue-200 hover:shadow-md transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 ${dept.iconBg} rounded-xl flex items-center justify-center shadow-sm`}>
            <Icon size={22} className="text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-800">{dept.name}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{dept.description}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-300 hover:text-blue-500 transition-colors" title="Sửa">
            <Edit2 size={14} />
          </button>
          <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors" title="Xóa">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-gray-50 rounded-xl px-3 py-2 text-center">
          <p className="text-lg font-bold text-gray-800">{dept.memberCount}</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Thành viên</p>
        </div>
        <div className="bg-green-50 rounded-xl px-3 py-2 text-center">
          <p className="text-lg font-bold text-green-600">{onlineCount}</p>
          <p className="text-[10px] text-green-500 uppercase tracking-wide">Online</p>
        </div>
        <div className="bg-amber-50 rounded-xl px-3 py-2 text-center">
          <p className="text-lg font-bold text-amber-600">{busyCount}</p>
          <p className="text-[10px] text-amber-500 uppercase tracking-wide">Bận</p>
        </div>
      </div>

      {/* Member avatars */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex -space-x-2">
            {displayMembers.map((member, idx) => (
              <div
                key={member.id}
                className="relative group/member"
                title={member.name}
              >
                <div
                  className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white ${statusColors[member.status]}`}
                  style={{ zIndex: displayMembers.length - idx }}
                >
                  {member.avatar}
                </div>
                {/* Status dot */}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${statusColors[member.status]}`}
                />
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover/member:opacity-100 pointer-events-none transition-opacity z-20">
                  {member.name}
                  <div className={`text-[10px] ${member.status === 'online' ? 'text-green-300' : member.status === 'busy' ? 'text-amber-300' : 'text-gray-400'}`}>
                    {statusLabels[member.status]}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {remaining > 0 && (
            <span className="ml-2 text-xs text-gray-400 font-medium bg-gray-100 px-2 py-1 rounded-lg">
              +{remaining}
            </span>
          )}
        </div>

        {/* Lead count */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <UserCheck size={13} className="text-blue-400" />
          <span className="font-medium">{dept.leads}</span>
          <span className="text-gray-400">leads</span>
        </div>
      </div>

      {/* Active indicator */}
      {!dept.active && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span className="text-[11px] text-red-500 font-medium bg-red-50 px-2 py-1 rounded-lg">
            Đã ngừng hoạt động
          </span>
        </div>
      )}
    </div>
  );
}

// ===== MAIN COMPONENT =====

export default function DepartmentsPage() {
  const [departments] = useState(departmentsData);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDepts = departments.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalMembers = departments.reduce((sum, d) => sum + d.memberCount, 0);
  const totalLeads = departments.reduce((sum, d) => sum + d.leads, 0);
  const activeDepts = departments.filter((d) => d.active).length;

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Phòng ban</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {departments.length} phòng ban · {activeDepts} đang hoạt động · {totalMembers} thành viên · {totalLeads} leads
          </p>
        </div>
        <PrimaryButton icon={Plus}>
          Thêm phòng ban
        </PrimaryButton>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Building2 size={18} className="text-blue-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-800">{departments.length}</p>
            <p className="text-[11px] text-gray-400">Tổng phòng ban</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
            <Users size={18} className="text-green-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-800">{totalMembers}</p>
            <p className="text-[11px] text-gray-400">Thành viên</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <UserCheck size={18} className="text-purple-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-800">{totalLeads}</p>
            <p className="text-[11px] text-gray-400">Leads phụ trách</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Headphones size={18} className="text-amber-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-800">{activeDepts}</p>
            <p className="text-[11px] text-gray-400">Đang hoạt động</p>
          </div>
        </div>
      </div>

      {/* Department Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredDepts.map((dept) => (
          <DepartmentCard key={dept.id} dept={dept} />
        ))}

        {filteredDepts.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <Building2 size={40} className="text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-500">Không tìm thấy phòng ban nào</p>
            <p className="text-xs text-gray-400 mt-1">Thử tìm kiếm với từ khóa khác</p>
          </div>
        )}
      </div>
    </div>
  );
}
