import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Customize from './pages/Customize';
import Services from './pages/Services';
import Blog from './pages/Blog';
import Guide from './pages/Guide';
import AIConsultant from './pages/AIConsultant';
import Dashboard from './pages/Dashboard';
import { AppProvider } from './context/AppContext';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="explore" element={<Services />} />
            <Route path="customize" element={<Customize />} />
            <Route path="blog" element={<Blog />} />
            <Route path="guide" element={<Guide />} />
            <Route path="ai-consultant" element={<AIConsultant />} />
            <Route path="dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
