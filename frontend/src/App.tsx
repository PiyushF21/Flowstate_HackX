import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/shared/ProtectedRoute'
import PlaceholderPage from './components/shared/PlaceholderPage'
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

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* === Citizen Dashboard (4 pages) === */}
          <Route
            path="/citizen/area-map"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <AreaMapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/my-cars"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <MyCarsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/report"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <ReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/profile"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <CitizenProfilePage />
              </ProtectedRoute>
            }
          />

          {/* === Worker Dashboard (4 pages) === */}
          <Route
            path="/worker/dashboard"
            element={
              <ProtectedRoute allowedRoles={['field_worker']}>
                <WorkerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker/tasks"
            element={
              <ProtectedRoute allowedRoles={['field_worker']}>
                <TasksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker/assistant"
            element={
              <ProtectedRoute allowedRoles={['field_worker']}>
                <AssistantPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker/profile"
            element={
              <ProtectedRoute allowedRoles={['field_worker']}>
                <WorkerProfilePage />
              </ProtectedRoute>
            }
          />

          {/* === BMC Dashboard (4 pages — still placeholders) === */}
          <Route path="/bmc/dashboard" element={<ProtectedRoute allowedRoles={['bmc_supervisor']}><PlaceholderPage title="Issues Dashboard" role="bmc_supervisor" icon="📊" /></ProtectedRoute>} />
          <Route path="/bmc/workers" element={<ProtectedRoute allowedRoles={['bmc_supervisor']}><PlaceholderPage title="Workers Management" role="bmc_supervisor" icon="👷" /></ProtectedRoute>} />
          <Route path="/bmc/completed" element={<ProtectedRoute allowedRoles={['bmc_supervisor']}><PlaceholderPage title="Completed Work" role="bmc_supervisor" icon="✅" /></ProtectedRoute>} />
          <Route path="/bmc/reports" element={<ProtectedRoute allowedRoles={['bmc_supervisor']}><PlaceholderPage title="Reports & Analytics" role="bmc_supervisor" icon="📈" /></ProtectedRoute>} />

          {/* === State Government Dashboard (4 pages — still placeholders) === */}
          <Route path="/state/overview" element={<ProtectedRoute allowedRoles={['state_official']}><PlaceholderPage title="State Overview" role="state_official" icon="🏛️" /></ProtectedRoute>} />
          <Route path="/state/reports" element={<ProtectedRoute allowedRoles={['state_official']}><PlaceholderPage title="Weekly Reports" role="state_official" icon="📑" /></ProtectedRoute>} />
          <Route path="/state/allocation" element={<ProtectedRoute allowedRoles={['state_official']}><PlaceholderPage title="Fund Allocation" role="state_official" icon="💰" /></ProtectedRoute>} />
          <Route path="/state/accountability" element={<ProtectedRoute allowedRoles={['state_official']}><PlaceholderPage title="Accountability Board" role="state_official" icon="🏆" /></ProtectedRoute>} />

          {/* === NEXUS Agent Dashboard (3 pages — still placeholders) === */}
          <Route path="/nexus/constellation" element={<ProtectedRoute allowedRoles={['nexus_admin']}><PlaceholderPage title="Agent Constellation" role="nexus_admin" icon="🌌" /></ProtectedRoute>} />
          <Route path="/nexus/events" element={<ProtectedRoute allowedRoles={['nexus_admin']}><PlaceholderPage title="Event Stream" role="nexus_admin" icon="📡" /></ProtectedRoute>} />
          <Route path="/nexus/pipeline" element={<ProtectedRoute allowedRoles={['nexus_admin']}><PlaceholderPage title="Pipeline View" role="nexus_admin" icon="🔗" /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
