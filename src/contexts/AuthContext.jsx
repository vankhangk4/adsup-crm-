/**
 * AuthContext.jsx - Quản lý trạng thái đăng nhập bằng Context API
 * - Đọc user từ localStorage khi khởi tạo
 * - Hàm login / logout với hardcode credentials
 * - Lưu user vào localStorage khi đăng nhập thành công
 */
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'fptcrm_user';
const HARDCODED_USER = { name: 'Admin', email: 'admin@fpt.vn', role: 'Super Admin' };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = (email, password) => {
    if (email === HARDCODED_USER.email && password === '123456') {
      const userData = { ...HARDCODED_USER };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
      return userData;
    }
    throw new Error('Sai tài khoản hoặc mật khẩu');
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
