import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { setAuthFailureCallback } from '@shared';

// 코드 스플리팅 — 각 페이지를 별도 청크로 분리하여 초기 번들 크기 절감
// nsfwjs/TensorFlow.js 등 무거운 의존성이 필요한 페이지만 지연 로딩됨
const AuthPage = lazy(() => import('@/pages/AuthPage'));
const HomePage = lazy(() => import('@/pages/HomePage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const DocPage = lazy(() => import('@/pages/DocPage'));
const RecordPage = lazy(() => import('@/pages/RecordPage'));
const RankingPage = lazy(() => import('@/pages/RankingPage'));

// 인증 실패 시 SPA 내 navigate 등록 — BrowserRouter 내부에서 useNavigate 사용
function AuthFailureHandler(): null {
  const navigate = useNavigate();

  useEffect(() => {
    setAuthFailureCallback(() => {
      navigate('/auth');
    });
  }, [navigate]);

  return null;
}

// 앱 라우터
export function Router(): React.ReactElement {
  return (
    <BrowserRouter>
      <AuthFailureHandler />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/doc" element={<DocPage />} />
          <Route path="/record" element={<RecordPage />} />
          <Route path="/ranking" element={<RankingPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
