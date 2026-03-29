import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RootLayout from './components/layout/RootLayout';
import TeleModule from './components/tele/TeleModule';
import RoutingModule from './components/routing/RoutingModule';
import ServicesModule from './components/services/ServicesModule';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/routing" element={<RoutingPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/departments" element={<DepartmentsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/permissions" element={<PermissionsPage />} />
          <Route path="/tele" element={<TeleModule />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

// Placeholder pages - sẽ code chi tiết từng trang theo Bước 3
function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tổng Lead', value: '128', change: '+12%', color: 'blue' },
          { label: 'Lead mới', value: '24', change: '+5', color: 'green' },
          { label: 'Đang xử lý', value: '45', change: '-3', color: 'amber' },
          { label: 'Tỷ lệ chuyển đổi', value: '40.6%', change: '+2.1%', color: 'purple' },
        ].map((stat) => (
          <div key={stat.label} className="card p-5">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            <p className={`text-xs mt-1 ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
              {stat.change} so với tuần trước
            </p>
          </div>
        ))}
      </div>
      <div className="card p-5">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Danh sách Lead gần đây</h2>
        <p className="text-sm text-gray-400">→ Xem chi tiết tại trang <span className="text-blue-500">Quản lý Lead</span></p>
      </div>
    </div>
  );
}

function LeadsPage() { return <div className="text-gray-500">Trang Quản lý Lead - sẽ code ở Bước 3</div>; }
function RoutingPage() { return <RoutingModule />; }
function ServicesPage() { return <ServicesModule />; }
function ChatPage() { return <div className="text-gray-500">Trang Chat đa kênh - sẽ code ở Bước 3</div>; }
function DepartmentsPage() { return <div className="text-gray-500">Trang Phòng ban - sẽ code ở Bước 3</div>; }
function UsersPage() { return <div className="text-gray-500">Trang Quản trị người dùng - sẽ code ở Bước 3</div>; }
function PermissionsPage() { return <div className="text-gray-500">Trang Phân quyền - sẽ code ở Bước 3</div>; }
