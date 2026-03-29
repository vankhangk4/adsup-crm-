/**
 * RegisterPage - Trang Đăng ký CRM
 * Bố cục: 2 cột - Cột trái gradient + slogan | Cột phải form đăng ký
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Check, X } from 'lucide-react';
import { apiPost } from '../../services/api';

// ===== ILLUSTRATION =====

function CRMIllustration() {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center text-white p-12 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="flex flex-col items-center gap-6">
          {/* Register mockup */}
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20 w-80">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="h-3 bg-white/20 rounded w-3/4" />
                <div className="h-3 bg-white/15 rounded w-1/2" />
                <div className="h-3 bg-white/20 rounded w-2/3" />
              </div>
              <div className="h-8 bg-white/15 rounded-xl" />
              <div className="flex gap-2">
                <div className="flex-1 h-8 bg-green-400/60 rounded-lg" />
                <div className="flex-1 h-8 bg-white/15 rounded-lg" />
              </div>
            </div>
          </div>

          {/* Slogan */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2 leading-tight">
              Bắt đầu quản lý<br />
              <span className="text-blue-200">Tuyệt vời hơn</span>
            </h2>
            <p className="text-white/70 text-sm max-w-sm mx-auto">
              Tạo tài khoản CRM CRM và quản lý Lead ngay hôm nay
            </p>
          </div>

          {/* Features */}
          <div className="flex flex-col gap-2 mt-2">
            {[
              'Dễ dàng phân phối Lead tự động',
              'Quản lý khách hàng tập trung',
              'Báo cáo chi tiết, trực quan',
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-400/60 flex items-center justify-center">
                  <Check size={10} className="text-white" />
                </div>
                <span className="text-sm text-white/80">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-white/40 text-xs">CRM CRM  · Phiên bản 2026</p>
      </div>
    </div>
  );
}

// ===== PASSWORD STRENGTH =====

function PasswordStrength({ password }) {
  const checks = [
    { label: 'Ít nhất 8 ký tự', met: password.length >= 8 },
    { label: 'Có chữ hoa (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'Có số (0-9)', met: /[0-9]/.test(password) },
    { label: 'Có ký tự đặc biệt (!@#...)', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const strength = checks.filter((c) => c.met).length;
  const colors = ['bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-green-400'];
  const labels = ['', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'];

  return (
    <div className="mt-1.5 space-y-1">
      {/* Strength bar */}
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${strength > i ? colors[strength] : 'bg-gray-200'
              }`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <p className={`text-[10px] font-medium ${strength === 0 ? 'text-gray-400' : strength === 1 ? 'text-red-500' : strength === 2 ? 'text-amber-500' : strength === 3 ? 'text-blue-500' : 'text-green-500'
          }`}>
          {labels[strength] || 'Nhập mật khẩu'}
        </p>
        <p className="text-[10px] text-gray-400">{strength}/4 điều kiện</p>
      </div>
      {/* Checklist */}
      <div className="grid grid-cols-2 gap-x-4">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center gap-1">
            {check.met ? (
              <Check size={10} className="text-green-500 flex-shrink-0" />
            ) : (
              <div className="w-2.5 h-2.5 rounded-full border border-gray-300 flex-shrink-0" />
            )}
            <span className={`text-[10px] ${check.met ? 'text-green-600' : 'text-gray-400'}`}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== REGISTER FORM =====

export default function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // ===== VALIDATORS =====

  const validateName = (v) => {
    if (!v.trim()) return 'Họ tên là bắt buộc';
    if (v.trim().length < 2) return 'Họ tên phải có ít nhất 2 ký tự';
    return '';
  };

  const validateEmail = (v) => {
    if (!v) return 'Email là bắt buộc';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(v)) return 'Email không hợp lệ';
    return '';
  };

  const validatePassword = (v) => {
    if (!v) return 'Mật khẩu là bắt buộc';
    if (v.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự';
    if (!/[A-Z]/.test(v)) return 'Phải có ít nhất 1 chữ hoa';
    if (!/[0-9]/.test(v)) return 'Phải có ít nhất 1 số';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(v)) return 'Phải có ít nhất 1 ký tự đặc biệt';
    return '';
  };

  const validateConfirm = (v) => {
    if (!v) return 'Vui lòng xác nhận mật khẩu';
    if (v !== password) return 'Mật khẩu xác nhận không khớp';
    return '';
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const validators = {
      fullName: validateName,
      email: validateEmail,
      password: validatePassword,
      confirmPassword: validateConfirm,
    };
    if (validators[field]) {
      setErrors((prev) => ({
        ...prev, [field]: validators[field](
          field === 'fullName' ? fullName :
            field === 'email' ? email :
              field === 'password' ? password :
                confirmPassword
        )
      }));
    }
  };

  const validate = () => {
    const newErrors = {
      fullName: validateName(fullName),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validateConfirm(confirmPassword),
    };
    setErrors(newErrors);
    return !newErrors.fullName && !newErrors.email && !newErrors.password && !newErrors.confirmPassword;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ fullName: true, email: true, password: true, confirmPassword: true });
    if (!validate()) return;
    if (!agreed) {
      setErrors((prev) => ({ ...prev, agreed: 'Bạn cần đồng ý với các điều khoản' }));
      return;
    }

    setIsLoading(true);
    try {
      await apiPost('/auth/register', {
        full_name: fullName,
        email,
        password,
      });
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Đăng ký thất bại';
      setErrors((prev) => ({ ...prev, form: msg }));
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (field) => {
    const base = 'w-full pl-10 pr-10 py-3 border rounded-xl bg-white text-gray-800 text-sm transition-all duration-200 focus:outline-none focus:ring-2';
    if (errors[field] && touched[field]) {
      return `${base} border-red-300 focus:ring-red-200 focus:border-red-400`;
    }
    return `${base} border-gray-200 focus:ring-blue-200 focus:border-blue-400 hover:border-gray-300`;
  };

  const inputClassNoToggle = (field) => {
    const base = 'w-full pl-10 pr-4 py-3 border rounded-xl bg-white text-gray-800 text-sm transition-all duration-200 focus:outline-none focus:ring-2';
    if (errors[field] && touched[field]) {
      return `${base} border-red-300 focus:ring-red-200 focus:border-red-400`;
    }
    return `${base} border-gray-200 focus:ring-blue-200 focus:border-blue-400 hover:border-gray-300`;
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT: Gradient + Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        <CRMIllustration />
      </div>

      {/* RIGHT: Register Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-gray-50/50 overflow-y-auto">
        <div className="w-full max-w-md py-4">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <div>
              <span className="text-gray-900 font-bold text-lg">CRM CRM</span>
              <p className="text-gray-400 text-[11px] -mt-0.5">Hệ thống quản lý</p>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Đăng ký tài khoản CRM</h1>
          <p className="text-sm text-gray-400 mb-7">Tạo tài khoản để bắt đầu quản lý Lead</p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Họ tên */}
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">
                Họ tên
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (touched.fullName) setErrors((prev) => ({ ...prev, fullName: validateName(e.target.value) }));
                  }}
                  onBlur={() => handleBlur('fullName')}
                  placeholder="Nguyen Van A"
                  className={inputClassNoToggle('fullName')}
                  autoComplete="name"
                />
              </div>
              {errors.fullName && touched.fullName && (
                <p className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500">
                  <AlertCircle size={12} />
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (touched.email) setErrors((prev) => ({ ...prev, email: validateEmail(e.target.value) }));
                  }}
                  onBlur={() => handleBlur('email')}
                  placeholder="nhap.email@cong-ty.vn"
                  className={inputClassNoToggle('email')}
                  autoComplete="email"
                />
              </div>
              {errors.email && touched.email && (
                <p className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500">
                  <AlertCircle size={12} />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Mật khẩu */}
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (touched.password) setErrors((prev) => ({ ...prev, password: validatePassword(e.target.value) }));
                  }}
                  onBlur={() => handleBlur('password')}
                  placeholder="••••••••"
                  className={inputClass('password')}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <PasswordStrength password={password} />
              {errors.password && touched.password && (
                <p className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500">
                  <AlertCircle size={12} />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Xác nhận mật khẩu */}
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (touched.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: validateConfirm(e.target.value) }));
                  }}
                  onBlur={() => handleBlur('confirmPassword')}
                  placeholder="••••••••"
                  className={inputClass('confirmPassword')}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Match indicator */}
              {confirmPassword && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  {confirmPassword === password ? (
                    <>
                      <Check size={12} className="text-green-500" />
                      <span className="text-xs text-green-500">Mật khẩu khớp</span>
                    </>
                  ) : (
                    <>
                      <X size={12} className="text-red-500" />
                      <span className="text-xs text-red-500">Mật khẩu không khớp</span>
                    </>
                  )}
                </div>
              )}
              {errors.confirmPassword && touched.confirmPassword && (
                <p className="flex items-center gap-1.5 mt-1 text-xs text-red-500">
                  <AlertCircle size={12} />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms checkbox */}
            <div>
              <label className="flex items-start gap-2.5 cursor-pointer group">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => {
                      setAgreed(e.target.checked);
                      if (e.target.checked) setErrors((prev) => ({ ...prev, agreed: '' }));
                    }}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${agreed ? 'bg-blue-500 border-blue-500' : 'border-gray-300 group-hover:border-blue-400'
                    }`}>
                    {agreed && <Check size={11} className="text-white" />}
                  </div>
                </div>
                <span className="text-sm text-gray-600 leading-snug">
                  Tôi đồng ý với{' '}
                  <button type="button" className="text-blue-500 hover:text-blue-600 font-medium">
                    Điều khoản sử dụng
                  </button>
                  {' '}và{' '}
                  <button type="button" className="text-blue-500 hover:text-blue-600 font-medium">
                    Chính sách bảo mật
                  </button>
                </span>
              </label>
              {errors.agreed && (
                <p className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500">
                  <AlertCircle size={12} />
                  {errors.agreed}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:shadow-blue-300 disabled:shadow-none active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Tạo tài khoản
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-blue-500 hover:text-blue-600 font-semibold transition-colors">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
