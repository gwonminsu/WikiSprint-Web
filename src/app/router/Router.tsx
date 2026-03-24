import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getTokenStorage } from '@shared';
import AuthPage from '@/pages/AuthPage';
import HomePage from '@/pages/HomePage';
import SettingsPage from '@/pages/SettingsPage';

type PrivateRouteProps = {
  children: React.ReactNode;
};

// 인증된 사용자만 접근 가능한 라우트
function PrivateRoute({ children }: PrivateRouteProps): React.ReactElement {
  const tokenStorage = getTokenStorage();
  const accessToken = tokenStorage.getAccessToken();
  const isAuthenticated = !!accessToken;

  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />;
}

// 앱 라우터
export function Router(): React.ReactElement {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <SettingsPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
