import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Institutions from './pages/Institutions';
import Analytics from './pages/Analytics';
import Prediction from './pages/Prediction';
import AIAssistant from './pages/AIAssistant';
import SettingsPage from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="institutions" element={<Institutions />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="prediction" element={<Prediction />} />
          <Route path="ai-assistant" element={<AIAssistant />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
