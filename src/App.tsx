import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@components/common/ProtectedRoute';
import Loading from '@components/common/Loading';
import GlobalLoader from '@components/common/GlobalLoader';
import { ROUTES } from '@utils/constants';

// Code splitting with lazy loading
const Login = lazy(() => import('@components/Auth/Login/Login'));
const Dashboard = lazy(() => import('@components/Dashboard/Dashboard'));
const HealthStatus = lazy(() => import('@components/HealthStatus/HealthStatus'));
const Profile = lazy(() => import('@components/Profile/Profile'));
const GenerateLobbyPage = lazy(() => import('@components/GenerateLobbyPage/GenerateLobbyPage'));

function App() {
  return (
    <BrowserRouter>
      <GlobalLoader />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route
            path={ROUTES.DASHBOARD}
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.HEALTH}
            element={
              <ProtectedRoute>
                <HealthStatus />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.PROFILE}
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.GENERATE_LOBBY}
            element={
              <ProtectedRoute>
                <GenerateLobbyPage />
              </ProtectedRoute>
            }
          />
          <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
