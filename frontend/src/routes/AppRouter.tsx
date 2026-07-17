import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import Layout from '../components/Layout'

import LoginPage from '../pages/LoginPage'
import DashboardPage from '../pages/DashboardPage'
import EmployeeListPage from '../pages/EmployeeListPage'
import EmployeeFormPage from '../pages/EmployeeFormPage'
import EmployeeViewPage from '../pages/EmployeeViewPage'
import OrgChartPage from '../pages/OrgChartPage'
import ProfilePage from '../pages/ProfilePage'

const AppRouter = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Auth required for all */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            {/* Super Admin + HR only */}
            <Route element={<ProtectedRoute allowedRoles={['super_admin', 'hr_manager']} />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/employees" element={<EmployeeListPage />} />
              <Route path="/employees/new" element={<EmployeeFormPage />} />
              <Route path="/employees/:id/edit" element={<EmployeeFormPage />} />
            </Route>

            {/* All authenticated users */}
            <Route path="/employees/:id" element={<EmployeeViewPage />} />
            <Route path="/organization" element={<OrgChartPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
