/**
 * LoginPage - Trang Đăng nhập CRM
 * Bố cục: 2 cột - Cột trái gradient + slogan | Cột phải form đăng nhập
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// ===== LOGIN FORM COMPONENT =====

function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const validateEmail = (value) => {
    if (!value) return 'Email là bắt buộc';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Email không hợp lệ';
    return '';
  };

  const validatePassword = (value) => {
    if (!value) return 'Mật khẩu là bắt buộc';
    if (value.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
    return '';
  };

  const validate = () => {
    const newErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === 'email') setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
    if (field === 'password') setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setTouched({ email: true, password: true });
    if (!validate()) return;

    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setAuthError(err.response?.data?.detail || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    navigate('/');
  };

  const inputClass = (field) => {
    const base = 'w-full pl-10 pr-10 py-3 border rounded-xl bg-white text-gray-800 text-sm transition-all duration-200 focus:outline-none focus:ring-2';
    if (errors[field] && touched[field]) {
      return `${base} border-red-300 focus:ring-red-200 focus:border-red-400`;
    }
    return `${base} border-gray-200 focus:ring-blue-200 focus:border-blue-400 hover:border-gray-300`;
  };

  return (
    <div className="w-full max-w-md mx-auto">
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
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Chào mừng trở lại</h1>
      <p className="text-sm text-gray-400 mb-7">Đăng nhập để tiếp tục quản lý CRM của bạn</p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
              className={inputClass('email')}
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

        {/* Password */}
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
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && touched.password && (
            <p className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500">
              <AlertCircle size={12} />
              {errors.password}
            </p>
          )}
        </div>

        {/* Auth error */}
        {authError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600 font-medium">{authError}</p>
          </div>
        )}

        {/* Forgot password */}
        <div className="flex justify-end">
          <button type="button" className="text-xs text-blue-500 hover:text-blue-600 font-medium transition-colors">
            Quên mật khẩu?
          </button>
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
              Đăng nhập
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">hoặc</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Google login */}
      <button
        onClick={handleGoogleLogin}
        className="w-full py-3 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl text-sm font-medium text-gray-600 transition-all duration-200 flex items-center justify-center gap-2.5"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Đăng nhập với Google
      </button>

      {/* Sign up link */}
      <p className="text-center text-sm text-gray-500 mt-6">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="text-blue-500 hover:text-blue-600 font-semibold transition-colors">
          Tạo tài khoản mới
        </Link>
      </p>
    </div>
  );
}

// ===== ILLUSTRATION COMPONENT =====

function CRMIllustration() {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center text-white p-12 overflow-hidden">
      {/* Background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
      </div>

      {/* Floating cards */}
      <div className="relative z-10">
        {/* Central illustration */}
        <div className="flex flex-col items-center gap-6">
          {/* Dashboard mockup */}
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20 w-80">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1 h-16 bg-white/20 rounded-xl" />
                <div className="flex-1 h-16 bg-white/20 rounded-xl" />
                <div className="flex-1 h-16 bg-white/20 rounded-xl" />
              </div>
              <div className="h-24 bg-white/15 rounded-xl" />
              <div className="flex gap-2">
                <div className="flex-1 h-8 bg-white/15 rounded-lg" />
                <div className="flex-1 h-8 bg-white/15 rounded-lg" />
              </div>
            </div>
          </div>

          {/* Slogan */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2 leading-tight">
              Quản lý CRM<br />
              <span className="text-blue-200">Thông minh hơn</span>
            </h2>
            <p className="text-white/70 text-sm max-w-sm mx-auto">
              Tăng 40% hiệu suất bán hàng với hệ thống phân phối Lead tự động
            </p>
          </div>

          {/* Stats row */}
          <div className="flex gap-6 mt-2">
            {[
              { value: '128', label: 'Leads' },
              { value: '40%', label: 'Conversion' },
              { value: '24/7', label: 'Support' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-white/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom tagline */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-white/40 text-xs">CRM CRM  · Phiên bản 2026</p>
      </div>
    </div>
  );
}

// ===== MAIN EXPORT =====

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* LEFT: Gradient + Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        <CRMIllustration />
      </div>

      {/* RIGHT: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-gray-50/50">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
