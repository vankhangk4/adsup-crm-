import { useState } from 'react'
import { RootLayout } from './components/layout'
import { TeleModule } from './components/tele'
import AuthModule from './components/auth/AuthModule'
import PageModule from './components/page/PageModule'
import ServiceModule from './components/service/ServiceModule'
import ScriptModule from './components/script/ScriptModule'
import PermissionModule from './components/permission/PermissionModule'
import RoutingModule from './components/routing/RoutingModule'
import LeadModule from './components/lead/LeadModule'
import ConversationModule from './components/conversation/ConversationModule'

// Placeholder components for other modules
function PlaceholderModule({ module, title }) {
  return (
    <div className="card p-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">📋</span>
        </div>
        <h2 className="text-lg font-semibold text-slate-800 mb-2">{title}</h2>
        <p className="text-sm text-slate-500 mb-4">
          Module {module} — Giao diện đang trong quá trình phát triển
        </p>
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-sm px-4 py-2 rounded-lg">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          Đang phát triển
        </div>
      </div>

      {/* Mock content for demo */}
      {module === 1 && <AuthModulePreview />}
      {module === 2 && <PageModulePreview />}
    </div>
  )
}

function AuthModulePreview() {
  const users = [
    { id: 1, name: 'Nguyễn Thị Lan', role: 'Nhân viên Tele', email: 'lan.nguyen@company.com', status: 'active' },
    { id: 2, name: 'Trần Văn Minh', role: 'Trưởng nhóm Tele', email: 'minh.tran@company.com', status: 'active' },
    { id: 3, name: 'Lê Thu Hà', role: 'Nhân viên Page', email: 'ha.le@company.com', status: 'active' },
    { id: 4, name: 'Phạm Đức Anh', role: 'Admin', email: 'anh.pham@company.com', status: 'active' },
    { id: 5, name: 'Hoàng Thị Mai', role: 'Marketing', email: 'mai.hoang@company.com', status: 'inactive' },
  ]

  return (
    <div className="mt-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-700">Danh sách nhân viên ({users.length})</h3>
        <button className="btn-primary text-sm">
          + Thêm nhân viên
        </button>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-header">Tên</th>
              <th className="table-header">Email</th>
              <th className="table-header">Vai trò</th>
              <th className="table-header">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="table-row">
                <td className="table-cell font-medium">{u.name}</td>
                <td className="table-cell text-slate-500">{u.email}</td>
                <td className="table-cell"><span className="badge-blue">{u.role}</span></td>
                <td className="table-cell">
                  <span className={u.status === 'active' ? 'badge-green' : 'badge-gray'}>
                    {u.status === 'active' ? 'Hoạt động' : 'Tắt'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PageModulePreview() {
  const pages = [
    { id: 1, name: 'UPC Clinic Hà Nội', type: 'Facebook', nicks: 5, status: 'active', leads: 124 },
    { id: 2, name: 'UPC Beauty Sài Gòn', type: 'Facebook', nicks: 4, status: 'active', leads: 98 },
    { id: 3, name: 'UPC Da Liễu', type: 'Zalo OA', nicks: 3, status: 'active', leads: 67 },
    { id: 4, name: 'UPC Spa & Wellness', type: 'Instagram', nicks: 2, status: 'inactive', leads: 34 },
  ]

  return (
    <div className="mt-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-700">Danh sách Page ({pages.length})</h3>
        <button className="btn-primary text-sm">+ Thêm Page</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {pages.map((p) => (
          <div key={p.id} className="card p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-slate-800">{p.name}</h4>
                <span className="badge-blue mt-1">{p.type}</span>
              </div>
              <span className={p.status === 'active' ? 'badge-green' : 'badge-gray'}>
                {p.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>👥 {p.nicks} nick</span>
              <span>📋 {p.leads} lead</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function LeadModulePreview() {
  const leads = [
    { name: 'Trần Minh Anh', service: 'Mí', status: 'Hẹn lịch', source: 'UPC HN', revenue: 0 },
    { name: 'Lê Hoàng Nam', service: 'Lõm Hóp', status: 'Đã gọi lần 1', source: 'UPC HN', revenue: 0 },
    { name: 'Phạm Thu Hà', service: 'Da Liễu', status: 'Đã đặt cọc', source: 'UPC Da Liễu', revenue: '8M' },
    { name: 'Hoàng Đức Minh', service: 'Filler', status: 'Không liên lạc', source: 'UPC SG', revenue: 0 },
    { name: 'Nguyễn Thị Mai', service: 'Nâng Mũi', status: 'Từ chối', source: 'UPC HN', revenue: 0 },
    { name: 'Vũ Thị Hương', service: 'Mí', status: 'Mới tiếp nhận', source: 'UPC Spa', revenue: 0 },
  ]

  return (
    <div className="mt-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-700">Danh sách Lead ({leads.length})</h3>
        <button className="btn-primary text-sm">+ Tạo Lead</button>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-header">Khách hàng</th>
              <th className="table-header">Dịch vụ</th>
              <th className="table-header">Trạng thái</th>
              <th className="table-header">Nguồn</th>
              <th className="table-header">Doanh thu</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l, i) => (
              <tr key={i} className="table-row">
                <td className="table-cell font-medium">{l.name}</td>
                <td className="table-cell"><span className="badge-gray">{l.service}</span></td>
                <td className="table-cell"><span className="badge-blue">{l.status}</span></td>
                <td className="table-cell text-slate-500">{l.source}</td>
                <td className="table-cell">{l.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const moduleNames = {
  1: 'Người dùng & Phân quyền',
  2: 'Quản trị Page',
  3: 'Hội thoại Page',
  4: 'Khách hàng & Lead',
  5: 'Quản trị Dịch vụ',
  6: 'Quản trị Kịch bản',
  7: 'Cấp số & Chia số',
  8: 'Module Tele',
  9: 'Phân quyền Chi tiết',
  10: 'Quản trị Hệ thống',
}

export default function App() {
  const [activeModule, setActiveModule] = useState(8) // Default to Tele Module

  return (
    <RootLayout activeModule={activeModule} onModuleChange={setActiveModule}>
      {activeModule === 1 ? (
        <AuthModule />
      ) : activeModule === 2 ? (
        <PageModule />
      ) : activeModule === 3 ? (
        <ConversationModule />
      ) : activeModule === 5 ? (
        <ServiceModule />
      ) : activeModule === 6 ? (
        <ScriptModule />
      ) : activeModule === 8 ? (
        <TeleModule />
      ) : activeModule === 7 ? (
        <RoutingModule />
      ) : activeModule === 4 ? (
        <LeadModule />
      ) : activeModule === 9 ? (
        <PermissionModule />
      ) : (
        <PlaceholderModule module={activeModule} title={moduleNames[activeModule]} />
      )}
    </RootLayout>
  )
}
