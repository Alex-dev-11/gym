import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  //console.log('ProtectedRoute check:', { token: !!token, user: userStr }); // 👈 Для отладки

  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userStr);

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/clients" replace />;
  }

  return <>{children}</>;
}