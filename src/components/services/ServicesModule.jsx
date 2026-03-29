/**
 * ServicesModule - Trang Mô đun 5: Quản trị Dịch vụ và Sản phẩm
 * Bố cục: 2 cột - Danh sách Dịch vụ (trái) + Cấu hình phân quyền (phải)
 */
import { useState, useEffect } from 'react';
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
  Inbox,
} from 'lucide-react';
import PrimaryButton from '../common/PrimaryButton';
import * as serviceService from '../../services/serviceService';

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

function EmptyState({ message = 'Chưa có dữ liệu' }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
        <Inbox size={24} className="text-gray-300" />
      </div>
      <p className="text-sm font-medium text-gray-500">{message}</p>
      <p className="text-xs text-gray-400 mt-1">Thử tìm kiếm với từ khóa khác</p>
    </div>
  );
}

function LoadingSkeleton({ rows = 8, cols = 5 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {Array.from({ length: rows * cols }).map((_, idx) => (
        <div key={idx} className="bg-gray-50 rounded-xl border border-gray-100 p-4 animate-pulse">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 bg-gray-200 rounded-2xl" />
          </div>
          <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
          <div className="h-2 bg-gray-100 rounded w-1/2 mx-auto mb-2" />
          <div className="flex justify-center mt-2">
            <div className="h-5 w-16 bg-gray-100 rounded" />
          </div>
          <div className="h-2 bg-gray-100 rounded w-1/3 mx-auto mt-1.5" />
        </div>
      ))}
    </div>
  );
}

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
  const [serviceCategories, setServiceCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [teleGroups, setTeleGroups] = useState([]);
  const [pageList, setPageList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [rightTab, setRightTab] = useState('tele');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all data on mount
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const [servicesRes] = await Promise.all([
          serviceService.list({ page_size: 100 }),
        ]);

        const servicesData = servicesRes?.data?.items || servicesRes?.data || servicesRes || [];

        // Normalize API services to UI shape
        const normalized = servicesData.map((s) => ({
          id: s.id,
          name: s.name,
          code: s.code,
          price: s.description || '',
          status: s.is_active,
          category: s.category || 'Chung',
          image: s.code?.toLowerCase().substring(0, 6) || 'filler',
          iconBg: 'bg-blue-500',
          color: 'from-blue-50 to-blue-100',
          teleGroup: s.tele_group || '',
        }));

        setServices(normalized);
        // Group services by category
        const categories = [...new Set(normalized.map((s) => s.category))].map((name) => ({
          id: name,
          name,
          color: 'bg-blue-500',
        }));
        setServiceCategories(categories);
        setSelectedCategory(categories[0] || null);

        // Tele groups and pages would come from separate endpoints
        setTeleGroups([]);
        setPageList([]);
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Không thể tải dữ liệu dịch vụ');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredServices = services.filter((s) => {
    if (!selectedCategory) return false;
    const matchCategory = s.category === selectedCategory.name;
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleToggleService = async (serviceId) => {
    const service = services.find((s) => s.id === serviceId);
    if (!service) return;
    try {
      await serviceService.toggleStatus(serviceId, !service.status);
      setServices((prev) =>
        prev.map((s) => (s.id === serviceId ? { ...s, status: !s.status } : s))
      );
    } catch (err) {
      console.error('Failed to toggle service status:', err);
    }
  };

  // Stats
  const activeServices = services.filter((s) => s.status).length;
  const totalServices = services.length;
  const categoryCount = serviceCategories.length;

  // Derive icon/color for selected category from the category data
  const CATEGORY_ICON_MAP = {
    'Thẩm mỹ da': { icon: Sparkles, color: 'bg-pink-500' },
    'Phẫu thuật': { icon: Scissors, color: 'bg-red-500' },
    'Điều trị': { icon: HeartPulse, color: 'bg-green-500' },
    'Tư vấn': { icon: Stethoscope, color: 'bg-blue-500' },
    'Mắt': { icon: Eye, color: 'bg-purple-500' },
    'Dược phẩm': { icon: Pill, color: 'bg-amber-500' },
  };

  const catMeta = selectedCategory ? (CATEGORY_ICON_MAP[selectedCategory.name] || { icon: LayoutGrid, color: 'bg-gray-400' }) : { icon: LayoutGrid, color: 'bg-gray-400' };
  const CatIcon = catMeta.icon;

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
            {isLoading ? (
              // Loading skeleton for categories
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2.5 px-4 py-2.5">
                  <div className="w-7 h-7 bg-gray-200 rounded-lg animate-pulse flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded w-16 mb-1 animate-pulse" />
                    <div className="h-2 bg-gray-100 rounded w-10 animate-pulse" />
                  </div>
                </div>
              ))
            ) : serviceCategories.length > 0 ? (
              serviceCategories.map((cat) => {
                const Icon = cat.icon || LayoutGrid;
                const isActive = selectedCategory?.id === cat.id;
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
              })
            ) : (
              <div className="px-4 py-6 text-center">
                <p className="text-xs text-gray-400">Chưa có nhóm dịch vụ</p>
              </div>
            )}
          </nav>
        </div>

        {/* Service cards */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 ${selectedCategory ? catMeta.color : 'bg-gray-400'} rounded-lg flex items-center justify-center`}>
                    <CatIcon size={12} className="text-white" />
                  </div>
                  <h2 className="text-base font-semibold text-gray-900">
                    {selectedCategory ? selectedCategory.name : 'Dịch vụ'}
                  </h2>
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
                placeholder={`Tìm kiếm trong ${selectedCategory ? selectedCategory.name : 'dịch vụ'}...`}
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
            {isLoading ? (
              <LoadingSkeleton rows={2} cols={5} />
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-3">
                  <X size={24} className="text-red-300" />
                </div>
                <p className="text-sm font-medium text-red-500">{error}</p>
                <p className="text-xs text-gray-400 mt-1">Vui lòng thử lại</p>
              </div>
            ) : filteredServices.length > 0 ? (
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
              <EmptyState message={searchQuery ? 'Không có dịch vụ nào phù hợp' : 'Chưa có dữ liệu'} />
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
