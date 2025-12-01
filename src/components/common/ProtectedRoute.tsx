import { Navigate } from 'react-router-dom';
import { authApi } from '@services/api';
import { ROUTES } from '@utils/constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = authApi.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

