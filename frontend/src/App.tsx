import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/shared/ProtectedRoute'
import LoginPage from './pages/LoginPage'

// Citizen Pages
import AreaMapPage from './pages/citizen/AreaMapPage'
import MyCarsPage from './pages/citizen/MyCarsPage'
import ReportPage from './pages/citizen/ReportPage'
import CitizenProfilePage from './pages/citizen/ProfilePage'

// Worker Pages
import WorkerDashboardPage from './pages/worker/DashboardPage'
import TasksPage from './pages/worker/TasksPage'
import AssistantPage from './pages/worker/AssistantPage'
import WorkerProfilePage from './pages/worker/WorkerProfilePage'

import IssuesDashboard from './pages/bmc/IssuesDashboard'
import WorkersPage from './pages/bmc/WorkersPage'
import CompletedPage from './pages/bmc/CompletedPage'
import ReportsPage from './pages/bmc/ReportsPage'

import OverviewPage from './pages/state/OverviewPage'
import WeeklyReportsPage from './pages/state/WeeklyReportsPage'
import AllocationPage from './pages/state/AllocationPage'
import AccountabilityPage from './pages/state/AccountabilityPage'

import ConstellationPage from './pages/nexus/ConstellationPage'
import EventStreamPage from './pages/nexus/EventStreamPage'
import PipelinePage from './pages/nexus/PipelinePage'

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* === Citizen Dashboard (4 pages) === */}
          <Route path="/citizen/area-map" element={<ProtectedRoute allowedRoles={['citizen']}><AreaMapPage /></ProtectedRoute>} />
          <Route path="/citizen/my-cars" element={<ProtectedRoute allowedRoles={['citizen']}><MyCarsPage /></ProtectedRoute>} />
          <Route path="/citizen/report" element={<ProtectedRoute allowedRoles={['citizen']}><ReportPage /></ProtectedRoute>} />
          <Route path="/citizen/profile" element={<ProtectedRoute allowedRoles={['citizen']}><CitizenProfilePage /></ProtectedRoute>} />

          {/* === Worker Dashboard (4 pages) === */}
          <Route path="/worker/dashboard" element={<ProtectedRoute allowedRoles={['field_worker']}><WorkerDashboardPage /></ProtectedRoute>} />
          <Route path="/worker/tasks" element={<ProtectedRoute allowedRoles={['field_worker']}><TasksPage /></ProtectedRoute>} />
          <Route path="/worker/assistant" element={<ProtectedRoute allowedRoles={['field_worker']}><AssistantPage /></ProtectedRoute>} />
          <Route path="/worker/profile" element={<ProtectedRoute allowedRoles={['field_worker']}><WorkerProfilePage /></ProtectedRoute>} />

          {/* === BMC Dashboard (4 pages) === */}
          <Route path="/bmc/dashboard" element={<ProtectedRoute allowedRoles={['bmc_supervisor']}><IssuesDashboard /></ProtectedRoute>} />
          <Route path="/bmc/workers" element={<ProtectedRoute allowedRoles={['bmc_supervisor']}><WorkersPage /></ProtectedRoute>} />
          <Route path="/bmc/completed" element={<ProtectedRoute allowedRoles={['bmc_supervisor']}><CompletedPage /></ProtectedRoute>} />
          <Route path="/bmc/reports" element={<ProtectedRoute allowedRoles={['bmc_supervisor']}><ReportsPage /></ProtectedRoute>} />

          {/* === State Government Dashboard (4 pages) === */}
          <Route path="/state/overview" element={<ProtectedRoute allowedRoles={['state_official']}><OverviewPage /></ProtectedRoute>} />
          <Route path="/state/reports" element={<ProtectedRoute allowedRoles={['state_official']}><WeeklyReportsPage /></ProtectedRoute>} />
          <Route path="/state/allocation" element={<ProtectedRoute allowedRoles={['state_official']}><AllocationPage /></ProtectedRoute>} />
          <Route path="/state/accountability" element={<ProtectedRoute allowedRoles={['state_official']}><AccountabilityPage /></ProtectedRoute>} />

          {/* === NEXUS Agent Dashboard (3 pages) === */}
          <Route path="/nexus/constellation" element={<ProtectedRoute allowedRoles={['nexus_admin']}><ConstellationPage /></ProtectedRoute>} />
          <Route path="/nexus/events" element={<ProtectedRoute allowedRoles={['nexus_admin']}><EventStreamPage /></ProtectedRoute>} />
          <Route path="/nexus/pipeline" element={<ProtectedRoute allowedRoles={['nexus_admin']}><PipelinePage /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
