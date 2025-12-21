import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/AuthContext'
import { Login } from './pages/Login'
import { RegisterAdmin } from './pages/RegisterAdmin'
import { LandingPage } from './pages/LandingPage'
import { StudentLayout } from './features/student/StudentLayout'
import { StudentHome } from './features/student/StudentHome'
import { CaptureEvidence } from './features/student/CaptureEvidence'
import { StudentFeed } from './features/student/StudentFeed'
import { StudentOpportunities } from './features/student/StudentOpportunities'
import { StudentCourseDetail } from './features/student/StudentCourseDetail'
import { TeacherDashboard } from './features/teacher/TeacherDashboard'
import { TeacherCourseManager } from './features/teacher/TeacherCourseManager'
import { PartnerShowcase } from './features/partner/PartnerShowcase'
import { AdminDashboard } from './features/admin/AdminDashboard'
import { ResourceList } from './features/admin/Resources/ResourceList'
import { SubjectsManager } from './features/admin/Academic/SubjectsManager'
import { ResourceBuilder } from './features/admin/Resources/ResourceBuilder'
import { OpportunitiesManager } from './features/admin/Opportunities/OpportunitiesManager'
import { UsersManager } from './features/admin/Users/UsersManager'
import { CohortsManager } from './features/admin/Cohorts/CohortsManager'
import { CohortDetail } from './features/admin/Cohorts/CohortDetail'
import { ImpactMap } from './features/public/ImpactMap'
import { useOfflineSync } from './hooks/useOfflineSync'
import { useAutoSync } from './hooks/useAutoSync'

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { session, role, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-primary">Cargando...</div>
  if (!session) return <Navigate to="/login" />

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <div className="p-10 text-center">No tienes permiso para ver esta página ({role}).</div>
  }

  return children
}

function Approutes() {
  const { loading } = useAuth()
  const { isOnline, isSyncing } = useOfflineSync()

  // Silent Sync Hook
  const { syncMessage } = useAutoSync()

  if (loading) return <div className="h-screen flex items-center justify-center text-primary">Cargando Adaptatón...</div>

  return (
    <div className="min-h-screen bg-background font-sans text-text-main">
      {/* Offline & Sync Indicators */}
      {!isOnline && (
        <div className="bg-red-500 text-white text-center text-xs py-1 transition-all">
          Modo Offline - Guardando en dispositivo
        </div>
      )}
      {isSyncing && (
        <div className="bg-blue-500 text-white text-center text-xs py-1 transition-all">
          Sincronizando datos...
        </div>
      )}
      {syncMessage && (
        <div className="bg-green-600 text-white text-center text-xs py-1 font-bold transition-all animate-pulse">
          {syncMessage}
        </div>
      )}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register-admin" element={<RegisterAdmin />} />
        <Route path="/map" element={<ImpactMap />} />

        {/* Role Redirection - Explicit and Robust */}
        {/* Role Redirection now happens inside the Login or specific checks if needed, but Root is Landing */}
        <Route path="/" element={<LandingPage />} />

        {/* Student Routes */}
        <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<StudentHome />} />
          <Route path="capture" element={<CaptureEvidence />} />
          <Route path="feed" element={<StudentFeed />} />
          <Route path="opportunities" element={<StudentOpportunities />} />
          <Route path="course/:id" element={<StudentCourseDetail />} />
        </Route>

        {/* Teacher Routes */}
        <Route path="/teacher" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherDashboard />
          </ProtectedRoute>
        } />
        <Route path="/teacher/course/:id" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherCourseManager />
          </ProtectedRoute>
        } />

        {/* Partner Routes */}
        <Route path="/partner" element={
          <ProtectedRoute allowedRoles={['partner']}>
            <PartnerShowcase />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Admin Sub-Routes (Academic) */}
        <Route path="/admin/subjects" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <SubjectsManager />
          </ProtectedRoute>
        } />

        {/* Admin Sub-Routes (Users) */}
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UsersManager />
          </ProtectedRoute>
        } />

        {/* Admin Sub-Routes (Resources) */}
        <Route path="/admin/resources" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ResourceList />
          </ProtectedRoute>
        } />
        <Route path="/admin/resources/new" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ResourceBuilder />
          </ProtectedRoute>
        } />
        <Route path="/admin/resources/:id" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ResourceBuilder />
          </ProtectedRoute>
        } />

        {/* Admin Sub-Routes (Opportunities) */}
        <Route path="/admin/opportunities" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <OpportunitiesManager />
          </ProtectedRoute>
        } />


        {/* Admin Sub-Routes (Cohorts) */}
        <Route path="/admin/cohorts" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <CohortsManager />
          </ProtectedRoute>
        } />
        <Route path="/admin/cohorts/:id" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <CohortDetail />
          </ProtectedRoute>
        } />

        {/* Catch all - 404 to Home (Trigger Redirect) */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Approutes />
      </AuthProvider>
    </Router>
  )
}

export default App
