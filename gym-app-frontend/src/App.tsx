import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ClientsPage } from './pages/ClientsPage';
import { MembershipsPage } from './pages/MembershipsPage';
import { VisitsPage } from './pages/VisitsPage';
import { UsersPage } from './pages/UsersPage';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { EmployeesPage } from './pages/EmployeesPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/clients" replace />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="memberships" element={<MembershipsPage />} />
          <Route path="visits" element={<VisitsPage />} />
          <Route
            path="users"
            element={
              <ProtectedRoute requiredRole="admin">
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="employees"
            element={
              <ProtectedRoute requiredRole="admin">
                <EmployeesPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}