// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ClientsPage } from './pages/ClientsPage';
import { MembershipsPage } from './pages/MembershipsPage';
import { VisitsPage } from './pages/VisitsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout оборачивает все страницы */}
        <Route path="/" element={<Layout />}>
          {/* Редирект с корня на клиентов */}
          <Route index element={<Navigate to="/clients" replace />} />
          
          {/* Страницы */}
          <Route path="clients" element={<ClientsPage />} />
          <Route path="memberships" element={<MembershipsPage />} />
          <Route path="visits" element={<VisitsPage />} />
          
          {/* 404 — страница не найдена */}
          <Route path="*" element={<div>Страница не найдена</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;