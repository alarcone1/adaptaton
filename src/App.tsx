import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/AuthContext'
import { ToastProvider } from './lib/ToastContext'
import { Login } from './pages/Login'
import { RegisterAdmin } from './pages/RegisterAdmin'
import { LandingPage } from './pages/LandingPage'

import { StudentHome } from './features/student/StudentHome'
import { CaptureEvidence } from './features/student/CaptureEvidence'
import { StudentFeed } from './features/student/StudentFeed'
import { StudentOpportunities } from './features/student/StudentOpportunities'
import { StudentCourseDetail } from './features/student/StudentCourseDetail'
import { TeacherDashboard } from './features/teacher/TeacherDashboard'
import { TeacherCourseManager } from './features/teacher/TeacherCourseManager'

import { AdminDashboard } from './features/admin/AdminDashboard'
import { StudentLayout } from './features/student/StudentLayout'
import { TeacherLayout } from './features/teacher/TeacherLayout'
import { AdminLayout } from './features/admin/AdminLayout'
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

import { PartnerLayout } from './features/partner/PartnerLayout'
import { PartnerShowcase } from './features/partner/PartnerShowcase'
import { MyLeads } from './features/partner/MyLeads'

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
            <TeacherLayout />
          </ProtectedRoute>
        }>
          <Route index element={<TeacherDashboard />} />
          <Route path="course/:id" element={<TeacherCourseManager />} />
        </Route>

        {/* Partner Routes */}
        <Route
          path="/partner"
          element={
            <ProtectedRoute allowedRoles={['partner']}>
              <PartnerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="showcase" replace />} />
          <Route path="showcase" element={<PartnerShowcase />} />
          <Route path="leads" element={<MyLeads />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UsersManager />} />
          <Route path="resources" element={<ResourceList />} />
          <Route path="resources/new" element={<ResourceBuilder />} />
          <Route path="resources/:id" element={<ResourceBuilder />} />
          <Route path="opportunities" element={<OpportunitiesManager />} />
          <Route path="cohorts" element={<CohortsManager />} />
          <Route path="cohorts/:id" element={<CohortDetail />} />
          <Route path="subjects" element={<SubjectsManager />} />
        </Route>

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
        <ToastProvider>
          <Approutes />
        </ToastProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
