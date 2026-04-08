import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthPage from '@/pages/AuthPage';
import HomePage from '@/pages/HomePage';
import SettingsPage from '@/pages/SettingsPage';
import DocPage from '@/pages/DocPage';
import RecordPage from '@/pages/RecordPage';
import RankingPage from '@/pages/RankingPage';

// 앱 라우터
export function Router(): React.ReactElement {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/doc" element={<DocPage />} />
        <Route path="/record" element={<RecordPage />} />
        <Route path="/ranking" element={<RankingPage />} />
      </Routes>
    </BrowserRouter>
  );
}
