/**
 * ProtectedRoute.jsx - Wrapper bảo vệ route nội bộ
 * - Đọc user từ AuthContext
 * - Nếu chưa đăng nhập → Navigate to /login
 * - Nếu đã đăng nhập → render children (hoặc Outlet)
 */
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
}
