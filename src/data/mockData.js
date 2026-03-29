/**
 * mockData.js - Dữ liệu giả cho hệ thống CRM
 * Bao gồm: Leads, Users, Services, Departments, Channels
 */

// ===== LEADS DATA =====
export const leadsData = [
  {
    id: 1,
    name: 'Nguyễn Văn An',
    phone: '0912 345 678',
    email: 'an.nguyen@email.com',
    source: 'Facebook',
    status: 'Mới',
    priority: 'Cao',
    assignedTo: 'Nguyễn Thu Hà',
    department: 'Kỹ thuật',
    note: 'Khách hàng quan tâm đến gói dịch vụ Enterprise',
    createdAt: '2026-03-28 10:30',
    lastContact: '2026-03-28 14:20',
  },
  {
    id: 2,
    name: 'Trần Thị Bình',
    phone: '0934 567 890',
    email: 'binh.tran@email.com',
    source: 'Website',
    status: 'Đang xử lý',
    priority: 'Trung bình',
    assignedTo: 'Lê Minh Tuấn',
    department: 'Kinh doanh',
    note: 'Yêu cầu báo giá chi tiết cho gói Premium',
    createdAt: '2026-03-27 09:15',
    lastContact: '2026-03-28 11:00',
  },
  {
    id: 3,
    name: 'Phạm Đức Cường',
    phone: '0901 234 567',
    email: 'cuong.pham@email.com',
    source: 'Google Ads',
    status: 'Thành công',
    priority: 'Cao',
    assignedTo: 'Nguyễn Thu Hà',
    department: 'Kỹ thuật',
    note: 'Đã ký hợp đồng dịch vụ 12 tháng',
    createdAt: '2026-03-25 14:00',
    lastContact: '2026-03-27 16:30',
  },
  {
    id: 4,
    name: 'Hoàng Thị Dung',
    phone: '0987 654 321',
    email: 'dung.hoang@email.com',
    source: 'Giới thiệu',
    status: 'Từ chối',
    priority: 'Thấp',
    assignedTo: 'Trần Văn Đạt',
    department: 'Marketing',
    note: 'Khách hàng không phù hợp với đối tượng mục tiêu',
    createdAt: '2026-03-26 08:45',
    lastContact: '2026-03-27 10:00',
  },
  {
    id: 5,
    name: 'Vũ Minh Đức',
    phone: '0963 852 741',
    email: 'duc.vu@email.com',
    source: 'Facebook',
    status: 'Mới',
    priority: 'Trung bình',
    assignedTo: 'Lê Minh Tuấn',
    department: 'Kinh doanh',
    note: 'Lead chất lượng cao, cần follow-up trong 24h',
    createdAt: '2026-03-28 16:00',
    lastContact: '-',
  },
  {
    id: 6,
    name: 'Đặng Thu Hà',
    phone: '0945 123 456',
    email: 'ha.dang@email.com',
    source: 'Website',
    status: 'Đang xử lý',
    priority: 'Cao',
    assignedTo: 'Nguyễn Thu Hà',
    department: 'Kỹ thuật',
    note: 'Cần demo sản phẩm vào tuần sau',
    createdAt: '2026-03-27 11:30',
    lastContact: '2026-03-28 15:00',
  },
  {
    id: 7,
    name: 'Lê Quang Huy',
    phone: '0919 876 543',
    email: 'huy.le@email.com',
    source: 'Google Ads',
    status: 'Thành công',
    priority: 'Cao',
    assignedTo: 'Trần Văn Đạt',
    department: 'Marketing',
    note: 'Convert thành công - doanh thu 50 triệu',
    createdAt: '2026-03-20 09:00',
    lastContact: '2026-03-26 14:00',
  },
  {
    id: 8,
    name: 'Bùi Thị Lan',
    phone: '0938 765 432',
    email: 'lan.bui@email.com',
    source: 'Zalo',
    status: 'Chưa liên hệ',
    priority: 'Thấp',
    assignedTo: '-',
    department: '-',
    note: 'Lead mới từ Zalo OA, chưa phân công',
    createdAt: '2026-03-28 17:30',
    lastContact: '-',
  },
];

// ===== USERS DATA =====
export const usersData = [
  {
    id: 1,
    name: 'Nguyễn Thu Hà',
    email: 'ha.nguyen@crm.vn',
    phone: '0912 111 222',
    role: 'Quản lý',
    department: 'Kỹ thuật',
    status: 'Hoạt động',
    lastLogin: '2026-03-29 08:30',
    avatar: 'NH',
  },
  {
    id: 2,
    name: 'Lê Minh Tuấn',
    email: 'tuan.le@crm.vn',
    phone: '0913 222 333',
    role: 'Nhân viên',
    department: 'Kinh doanh',
    status: 'Hoạt động',
    lastLogin: '2026-03-29 09:00',
    avatar: 'LT',
  },
  {
    id: 3,
    name: 'Trần Văn Đạt',
    email: 'dat.tran@crm.vn',
    phone: '0914 333 444',
    role: 'Nhân viên',
    department: 'Marketing',
    status: 'Hoạt động',
    lastLogin: '2026-03-29 08:45',
    avatar: 'TD',
  },
  {
    id: 4,
    name: 'Phạm Thị Mai',
    email: 'mai.pham@crm.vn',
    phone: '0915 444 555',
    role: 'Quản lý',
    department: 'Kinh doanh',
    status: 'Hoạt động',
    lastLogin: '2026-03-29 07:50',
    avatar: 'PM',
  },
  {
    id: 5,
    name: 'Hoàng Văn Bảo',
    email: 'bao.hoang@crm.vn',
    phone: '0916 555 666',
    role: 'Nhân viên',
    department: 'Kỹ thuật',
    status: 'Không hoạt động',
    lastLogin: '2026-03-25 16:00',
    avatar: 'HB',
  },
];

// ===== SERVICES DATA =====
export const servicesData = [
  {
    id: 1,
    name: 'Internet FPT',
    category: 'Internet',
    price: '299.000đ/tháng',
    status: 'Hoạt động',
    subscribers: 1250,
  },
  {
    id: 2,
    name: 'Truyền hình FPT',
    category: 'TV',
    price: '199.000đ/tháng',
    status: 'Hoạt động',
    subscribers: 890,
  },
  {
    id: 3,
    name: 'Camera AI',
    category: 'Camera',
    price: '399.000đ/tháng',
    status: 'Hoạt động',
    subscribers: 456,
  },
  {
    id: 4,
    name: 'FPT Play Box',
    category: 'Device',
    price: '599.000đ/tháng',
    status: 'Bảo trì',
    subscribers: 234,
  },
];

// ===== CHANNELS DATA =====
export const channelsData = [
  { id: 1, name: 'Facebook', icon: '💬', activeConversations: 45, unread: 12 },
  { id: 2, name: 'Zalo OA', icon: '💬', activeConversations: 38, unread: 8 },
  { id: 3, name: 'Website', icon: '🌐', activeConversations: 22, unread: 5 },
  { id: 4, name: 'Hotline', icon: '📞', activeConversations: 15, unread: 3 },
];

// ===== SIDEBAR MENU =====
export const sidebarMenu = [
  {
    group: 'Tổng quan',
    items: [
      { id: 'dashboard', label: 'Bảng điều khiển', icon: 'LayoutDashboard', path: '/' },
    ],
  },
  {
    group: 'Quản lý',
    items: [
      { id: 'leads', label: 'Quản lý Lead', icon: 'Users', path: '/leads' },
      { id: 'tele', label: 'Telemarketing', icon: 'Phone', path: '/tele' },
      { id: 'routing', label: 'Routing', icon: 'GitBranch', path: '/routing' },
      { id: 'services', label: 'Dịch vụ', icon: 'Box', path: '/services' },
    ],
  },
  {
    group: 'Giao tiếp',
    items: [
      { id: 'channels', label: 'Quản lý kênh', icon: 'Radio', path: '/channels' },
      { id: 'chat', label: 'Chat đa kênh', icon: 'MessageSquare', path: '/chat' },
    ],
  },
  {
    group: 'Hệ thống',
    items: [
      { id: 'departments', label: 'Phòng ban', icon: 'Building2', path: '/departments' },
      { id: 'users', label: 'Quản trị người dùng', icon: 'UserCog', path: '/users' },
      { id: 'permissions', label: 'Phân quyền', icon: 'Shield', path: '/permissions' },
    ],
  },
];

// ===== STATS DATA =====
export const dashboardStats = {
  totalLeads: 128,
  newLeads: 24,
  processing: 45,
  success: 52,
  rejected: 7,
  conversionRate: 40.6,
  revenue: '1,250,000,000',
  revenueChange: 12.5,
};
