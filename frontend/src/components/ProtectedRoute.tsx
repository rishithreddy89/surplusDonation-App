import { Navigate } from 'react-router-dom';
import { getAuthToken, getUser } from '@/lib/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const token = getAuthToken();
  const user = getUser();

  if (!token || !user) {
    return <Navigate to="/select-role" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/select-role" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
