/**
 * ServicesModule - Trang Mô đun 5: Quản trị Dịch vụ và Sản phẩm
 * Bố cục: 2 cột - Danh sách Dịch vụ (trái) + Cấu hình phân quyền (phải)
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
  Search,
  Sparkles,
  Scissors,
  HeartPulse,
  Stethoscope,
  Eye,
  Pill,
  Image,
  MessageSquare,
  Phone,
  Globe,
  LayoutGrid,
  Share2,
} from 'lucide-react';
import PrimaryButton from '../common/PrimaryButton';

// ===== MOCK DATA =====

const serviceCategories = [
  { id: 1, name: 'Thẩm mỹ da', icon: Sparkles, color: 'bg-pink-500' },
  { id: 2, name: 'Phẫu thuật', icon: Scissors, color: 'bg-red-500' },
  { id: 3, name: 'Điều trị', icon: HeartPulse, color: 'bg-green-500' },
  { id: 4, name: 'Tư vấn', icon: Stethoscope, color: 'bg-blue-500' },
  { id: 5, name: 'Mắt', icon: Eye, color: 'bg-purple-500' },
  { id: 6, name: 'Dược phẩm', icon: Pill, color: 'bg-amber-500' },
];

const servicesInit = [
  // Thẩm mỹ da
  {
    id: 1,
    name: 'Filler Ống Phi',
    category: 'Thẩm mỹ da',
    status: true,
    price: '2,500,000đ',
    image: 'filler',
    color: 'from-pink-100 to-rose-200',
    iconBg: 'bg-pink-500',
  },
  {
    id: 2,
    name: 'Nâng Mũi',
    category: 'Thẩm mỹ da',
    status: true,
    price: '15,000,000đ',
    image: 'nose',
    color: 'from-rose-100 to-pink-200',
    iconBg: 'bg-rose-500',
  },
  {
    id: 3,
    name: 'Căng Chỉ Da',
    category: 'Thẩm mỹ da',
    status: true,
    price: '8,000,000đ',
    image: 'thread',
    color: 'from-fuchsia-100 to-pink-200',
    iconBg: 'bg-fuchsia-500',
  },
  {
    id: 4,
    name: 'Trẻ hóa Da',
    category: 'Thẩm mỹ da',
    status: false,
    price: '3,500,000đ',
    image: 'rejuv',
    color: 'from-pink-50 to-rose-100',
    iconBg: 'bg-pink-400',
  },
  // Phẫu thuật
  {
    id: 5,
    name: 'Phẫu thuật Mắt',
    category: 'Phẫu thuật',
    status: true,
    price: '12,000,000đ',
    image: 'eyes',
    color: 'from-red-100 to-orange-200',
    iconBg: 'bg-red-500',
  },
  {
    id: 6,
    name: 'Nâng Ngực',
    category: 'Phẫu thuật',
    status: true,
    price: '45,000,000đ',
    image: 'breast',
    color: 'from-orange-100 to-red-200',
    iconBg: 'bg-orange-500',
  },
  // Điều trị
  {
    id: 7,
    name: 'Điều trị Mụn',
    category: 'Điều trị',
    status: true,
    price: '1,200,000đ',
    image: 'acne',
    color: 'from-green-100 to-emerald-200',
    iconBg: 'bg-green-500',
  },
  {
    id: 8,
    name: 'Laser Trị Thâm',
    category: 'Điều trị',
    status: false,
    price: '2,000,000đ',
    image: 'laser',
    color: 'from-emerald-50 to-green-100',
    iconBg: 'bg-emerald-500',
  },
  // Tư vấn
  {
    id: 9,
    name: 'Tư vấn Da liễu',
    category: 'Tư vấn',
    status: true,
    price: '500,000đ',
    image: 'consult',
    color: 'from-blue-100 to-indigo-200',
    iconBg: 'bg-blue-500',
  },
  {
    id: 10,
    name: 'Tư vấn Dinh dưỡng',
    category: 'Tư vấn',
    status: true,
    price: '400,000đ',
    image: 'nutrition',
    color: 'from-indigo-100 to-blue-200',
    iconBg: 'bg-indigo-500',
  },
];

const teleGroups = ['Nhóm Tele A', 'Nhóm Tele B', 'Nhóm Tele C'];
const pageList = [
  { id: 'fb1', name: 'Fanpage Chính', platform: 'facebook', pageId: 'FP-001' },
  { id: 'zalo1', name: 'Zalo OA Chính', platform: 'zalo', pageId: 'ZOA-001' },
  { id: 'web1', name: 'Website Đặt lịch', platform: 'website', pageId: 'WEB-001' },
  { id: 'hotline1', name: 'Hotline Tổng đài', platform: 'hotline', pageId: 'HL-001' },
  { id: 'fb2', name: 'Fanpage Phụ', platform: 'facebook', pageId: 'FP-002' },
];

// ===== SERVICE ICON MAPPING =====

const SERVICE_ICONS = {
  filler: Sparkles,
  nose: Scissors,
  thread: HeartPulse,
  rejuv: HeartPulse,
  eyes: Eye,
  breast: HeartPulse,
  acne: Sparkles,
  laser: Eye,
  consult: Stethoscope,
  nutrition: Pill,
};

// ===== SUB-COMPONENTS =====

function ServiceIcon({ type, iconBg, size = 'lg' }) {
  const IconComponent = SERVICE_ICONS[type] || LayoutGrid;
  const sizeClass = size === 'sm' ? 'w-10 h-10' : 'w-14 h-14';
  return (
    <div className={`${sizeClass} ${iconBg} rounded-2xl flex items-center justify-center`}>
      <IconComponent size={size === 'sm' ? 18 : 24} className="text-white" />
    </div>
  );
}

function ServiceCard({ service, isSelected, onClick, onToggle }) {
  return (
    <div
      onClick={onClick}
      className={`bg-gradient-to-br ${service.color} rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected
          ? 'border-blue-400 shadow-blue-100 ring-2 ring-blue-200'
          : 'border-white/60 hover:border-gray-200'
      }`}
    >
      {/* Image placeholder */}
      <div className="flex justify-center mb-3">
        <ServiceIcon type={service.image} iconBg={service.iconBg} />
      </div>

      {/* Name */}
      <h4 className="text-sm font-semibold text-gray-800 text-center mb-2 leading-tight">
        {service.name}
      </h4>

      {/* Price */}
      <p className="text-xs text-gray-500 text-center mb-2">{service.price}</p>

      {/* Status toggle */}
      <div className="flex items-center justify-center mt-2" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onToggle(service.id)}
          className="flex items-center gap-1.5"
          title={service.status ? 'Đang hoạt động' : 'Ngừng hoạt động'}
        >
          {service.status ? (
            <ToggleRight size={22} className="text-green-500" />
          ) : (
            <ToggleLeft size={22} className="text-gray-300" />
          )}
          <span className={`text-[11px] font-medium ${service.status ? 'text-green-600' : 'text-gray-400'}`}>
            {service.status ? 'Hoạt động' : 'Ngừng'}
          </span>
        </button>
      </div>

      {/* Category tag */}
      <p className="text-[10px] text-gray-400 text-center mt-1.5">{service.category}</p>
    </div>
  );
}

function TeleDistributionTab({ services, teleGroups }) {
  const [assignments, setAssignments] = useState(() => {
    const init = {};
    services.forEach((s) => {
      init[s.id] = s.teleGroup || '';
    });
    return init;
  });

  const selectedService = services.find((s) => s.teleGroup);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Phone size={13} className="text-blue-500" />
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
          Phân phối Tele cho dịch vụ
        </h4>
      </div>

      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 rounded-lg">
            <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide rounded-l-lg">
              Dịch vụ
            </th>
            <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide rounded-r-lg">
              Nhóm Tele
            </th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">{service.name}</span>
                </div>
              </td>
              <td className="px-3 py-2.5">
                <select
                  value={assignments[service.id] || ''}
                  onChange={(e) =>
                    setAssignments((prev) => ({ ...prev, [service.id]: e.target.value }))
                  }
                  className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 hover:border-blue-300 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-colors cursor-pointer"
                >
                  <option value="">-- Chọn nhóm --</option>
                  {teleGroups.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PagePermissionTab({ pageList }) {
  const [pages, setPages] = useState(
    pageList.reduce((acc, p) => ({ ...acc, [p.id]: { enabled: true, pageId: p.pageId } }), {})
  );

  const platformIcons = {
    facebook: Share2,
    zalo: MessageSquare,
    website: Globe,
    hotline: Phone,
  };

  const platformColors = {
    facebook: 'bg-blue-500',
    zalo: 'bg-blue-400',
    website: 'bg-green-500',
    hotline: 'bg-purple-500',
  };

  const platformLabels = {
    facebook: 'Facebook',
    zalo: 'Zalo OA',
    website: 'Website',
    hotline: 'Hotline',
  };

  const togglePage = (id) => {
    setPages((prev) => ({
      ...prev,
      [id]: { ...prev[id], enabled: !prev[id].enabled },
    }));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <LayoutGrid size={13} className="text-purple-500" />
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
          Quyền trang
        </h4>
      </div>

      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 rounded-lg">
            <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide rounded-l-lg w-8">
              #
            </th>
            <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Trang
            </th>
            <th className="text-center px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide w-20">
              Trạng thái
            </th>
            <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide rounded-r-lg">
              Page ID
            </th>
          </tr>
        </thead>
        <tbody>
          {pageList.map((page, idx) => {
            const IconComponent = platformIcons[page.platform] || Globe;
            const pColor = platformColors[page.platform];
            const pEnabled = pages[page.id]?.enabled;

            return (
              <tr
                key={page.id}
                className={`border-b border-gray-50 transition-colors ${
                  pEnabled ? 'hover:bg-gray-50' : 'opacity-50'
                }`}
              >
                <td className="px-3 py-3 text-xs text-gray-400">{idx + 1}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 ${pColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <IconComponent size={13} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{page.name}</p>
                      <p className="text-[10px] text-gray-400">{platformLabels[page.platform]}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-center">
                  <button onClick={() => togglePage(page.id)} className="inline-flex items-center gap-1">
                    {pEnabled ? (
                      <ToggleRight size={22} className="text-green-500" />
                    ) : (
                      <ToggleLeft size={22} className="text-gray-300" />
                    )}
                  </button>
                </td>
                <td className="px-3 py-3">
                  <select
                    value={pages[page.id]?.pageId || ''}
                    onChange={(e) =>
                      setPages((prev) => ({
                        ...prev,
                        [page.id]: { ...prev[page.id], pageId: e.target.value },
                      }))
                    }
                    disabled={!pEnabled}
                    className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 hover:border-blue-300 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="FP-001">FP-001 - Fanpage Chính</option>
                    <option value="FP-002">FP-002 - Fanpage Phụ</option>
                    <option value="ZOA-001">ZOA-001 - Zalo OA</option>
                    <option value="WEB-001">WEB-001 - Website</option>
                    <option value="HL-001">HL-001 - Hotline</option>
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ===== MAIN COMPONENT =====

export default function ServicesModule() {
  const [selectedCategory, setSelectedCategory] = useState(serviceCategories[0]);
  const [selectedService, setSelectedService] = useState(null);
  const [rightTab, setRightTab] = useState('tele');
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState(servicesInit);

  const filteredServices = services.filter((s) => {
    const matchCategory = s.category === selectedCategory.name;
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleToggleService = (serviceId) => {
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, status: !s.status } : s))
    );
  };

  // Stats
  const activeServices = services.filter((s) => s.status).length;
  const totalServices = services.length;
  const categoryCount = serviceCategories.length;

  return (
    <div className="flex gap-4 h-[calc(100vh-140px)]">
      {/* ===== LEFT COLUMN: Danh sách Dịch vụ ===== */}
      <div className="flex-1 flex gap-4 min-w-0">
        {/* Category sidebar */}
        <div className="w-48 flex-shrink-0 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-pink-50 to-rose-50">
            <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Nhóm dịch vụ
            </h3>
            <p className="text-[10px] text-gray-400 mt-0.5">{categoryCount} nhóm</p>
          </div>
          <nav className="flex-1 overflow-y-auto py-1">
            {serviceCategories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory.id === cat.id;
              const count = services.filter((s) => s.category === cat.name).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSelectedService(null);
                  }}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-50 border-r-2 border-blue-500'
                      : 'hover:bg-gray-50 border-r-2 border-transparent'
                  }`}
                >
                  <div className={`w-7 h-7 ${cat.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon size={14} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium truncate ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>
                      {cat.name}
                    </p>
                    <p className={`text-[10px] ${isActive ? 'text-blue-400' : 'text-gray-400'}`}>
                      {count} dịch vụ
                    </p>
                  </div>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Service cards */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 ${selectedCategory.color} rounded-lg flex items-center justify-center`}>
                    {(() => {
                      const Icon = selectedCategory.icon;
                      return <Icon size={12} className="text-white" />;
                    })()}
                  </div>
                  <h2 className="text-base font-semibold text-gray-900">{selectedCategory.name}</h2>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {activeServices}/{totalServices} dịch vụ đang hoạt động
                </p>
              </div>
              <PrimaryButton icon={Plus} size="sm">
                Thêm dịch vụ
              </PrimaryButton>
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={`Tìm kiếm trong ${selectedCategory.name}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Cards grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {filteredServices.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filteredServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    isSelected={selectedService?.id === service.id}
                    onClick={() => setSelectedService(service)}
                    onToggle={handleToggleService}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                  <Image size={24} className="text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-500">Không có dịch vụ nào</p>
                <p className="text-xs text-gray-400 mt-1">Thử tìm kiếm với từ khóa khác</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== RIGHT COLUMN: Cấu hình phân quyền ===== */}
      <div className="w-96 flex-shrink-0 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Check size={14} className="text-blue-500" />
            <h2 className="text-base font-semibold text-gray-900">Cấu hình phân quyền</h2>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg w-fit">
            <button
              onClick={() => setRightTab('tele')}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all duration-150 flex items-center gap-1.5 ${
                rightTab === 'tele'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Phone size={12} />
              Phân phối Tele
            </button>
            <button
              onClick={() => setRightTab('pages')}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all duration-150 flex items-center gap-1.5 ${
                rightTab === 'pages'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <LayoutGrid size={12} />
              Kịch bản & Phân loại
            </button>
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-4">
          {rightTab === 'tele' ? (
            <TeleDistributionTab services={services} teleGroups={teleGroups} />
          ) : (
            <PagePermissionTab pageList={pageList} />
          )}
        </div>
      </div>
    </div>
  );
}
