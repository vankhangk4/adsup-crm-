/**
 * mockPermissionData.js - Dữ liệu giả cho trang Phân quyền
 */

export const permissionGroups = [
  {
    group: 'Quản lý Lead',
    permissions: [
      { id: 'view_lead', label: 'Xem Lead' },
      { id: 'create_lead', label: 'Tạo Lead' },
      { id: 'edit_lead', label: 'Sửa Lead' },
      { id: 'delete_lead', label: 'Xóa Lead' },
      { id: 'transfer_lead', label: 'Chuyển Lead' },
      { id: 'assign_lead', label: 'Phân công Lead' },
    ],
  },
  {
    group: 'Telemarketing',
    permissions: [
      { id: 'make_call', label: 'Thực hiện cuộc gọi' },
      { id: 'view_call_history', label: 'Xem lịch sử cuộc gọi' },
      { id: 'manage_scripts', label: 'Quản lý kịch bản' },
      { id: 'view_queue', label: 'Xem hàng chờ Tele' },
    ],
  },
  {
    group: 'Chat & Kênh',
    permissions: [
      { id: 'reply_chat', label: 'Trả lời chat' },
      { id: 'manage_channel', label: 'Quản lý kênh' },
      { id: 'assign_page', label: 'Phân công Page' },
    ],
  },
  {
    group: 'Báo cáo',
    permissions: [
      { id: 'view_report', label: 'Xem Báo cáo' },
      { id: 'export_report', label: 'Xuất Báo cáo' },
      { id: 'view_dashboard', label: 'Xem Dashboard' },
    ],
  },
  {
    group: 'Quản lý Người dùng',
    permissions: [
      { id: 'view_user', label: 'Xem Người dùng' },
      { id: 'create_user', label: 'Tạo Người dùng' },
      { id: 'edit_user', label: 'Sửa Người dùng' },
      { id: 'delete_user', label: 'Xóa Người dùng' },
    ],
  },
  {
    group: 'Hệ thống',
    permissions: [
      { id: 'manage_role', label: 'Quản lý Vai trò' },
      { id: 'manage_department', label: 'Quản lý Phòng ban' },
      { id: 'manage_service', label: 'Quản lý Dịch vụ' },
      { id: 'manage_setting', label: 'Quản lý Cài đặt' },
      { id: 'manage_routing', label: 'Quản lý Routing' },
    ],
  },
];

export const rolesData = [
  {
    id: 1,
    name: 'Quản trị viên',
    description: 'Toàn quyền truy cập hệ thống CRM',
    color: 'bg-red-100 text-red-700',
    colorBorder: 'border-red-200',
    userCount: 1,
    permissions: [
      'view_lead', 'create_lead', 'edit_lead', 'delete_lead', 'transfer_lead', 'assign_lead',
      'make_call', 'view_call_history', 'manage_scripts', 'view_queue',
      'reply_chat', 'manage_channel', 'assign_page',
      'view_report', 'export_report', 'view_dashboard',
      'view_user', 'create_user', 'edit_user', 'delete_user',
      'manage_role', 'manage_department', 'manage_service', 'manage_setting', 'manage_routing',
    ],
    isSystem: true,
  },
  {
    id: 2,
    name: 'Tele Senior',
    description: 'Nhân viên Tele cấp cao - có quyền quản lý queue',
    color: 'bg-purple-100 text-purple-700',
    colorBorder: 'border-purple-200',
    userCount: 3,
    permissions: [
      'view_lead', 'create_lead', 'edit_lead', 'transfer_lead', 'assign_lead',
      'make_call', 'view_call_history', 'manage_scripts', 'view_queue',
      'reply_chat',
      'view_report', 'view_dashboard',
    ],
    isSystem: false,
  },
  {
    id: 3,
    name: 'Tele Junior',
    description: 'Nhân viên Tele cấp cơ bản - chỉ tiếp cận leads được gán',
    color: 'bg-blue-100 text-blue-700',
    colorBorder: 'border-blue-200',
    userCount: 8,
    permissions: [
      'view_lead', 'create_lead', 'edit_lead',
      'make_call', 'view_call_history',
      'reply_chat',
    ],
    isSystem: false,
  },
  {
    id: 4,
    name: 'Page Staff',
    description: 'Nhân viên phụ trách page - chat và thu thập lead',
    color: 'bg-green-100 text-green-700',
    colorBorder: 'border-green-200',
    userCount: 5,
    permissions: [
      'view_lead', 'create_lead',
      'reply_chat', 'assign_page',
    ],
    isSystem: false,
  },
  {
    id: 5,
    name: 'Marketing',
    description: 'Nhân viên Marketing - xem báo cáo và quản lý kênh',
    color: 'bg-pink-100 text-pink-700',
    colorBorder: 'border-pink-200',
    userCount: 2,
    permissions: [
      'view_lead', 'view_report', 'export_report', 'view_dashboard',
      'manage_channel',
    ],
    isSystem: false,
  },
  {
    id: 6,
    name: 'Kỹ thuật',
    description: 'Nhân viên Kỹ thuật - hỗ trợ kỹ thuật và bảo trì',
    color: 'bg-amber-100 text-amber-700',
    colorBorder: 'border-amber-200',
    userCount: 4,
    permissions: [
      'view_lead', 'view_report', 'view_dashboard',
      'manage_service',
    ],
    isSystem: false,
  },
];
