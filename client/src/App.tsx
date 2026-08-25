import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';

// Auth Pages
import { Login } from './pages/Login';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentAttendance } from './pages/student/StudentAttendance';
import { StudentTimetable } from './pages/student/StudentTimetable';
import { StudentSeat } from './pages/student/StudentSeat';
import { StudentExams } from './pages/student/StudentExams';

// Teacher Pages
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { TeacherAttendanceSession } from './pages/teacher/TeacherAttendanceSession';
import { TeacherMarks } from './pages/teacher/TeacherMarks';
import { TeacherAvailability } from './pages/teacher/TeacherAvailability';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminClassrooms } from './pages/admin/AdminClassrooms';
import { AdminSeating } from './pages/admin/AdminSeating';
import { AdminSubstitution } from './pages/admin/AdminSubstitution';
import { AdminTimetable } from './pages/admin/AdminTimetable';
import { AdminStaff } from './pages/admin/AdminStaff';
import { AdminNotices } from './pages/admin/AdminNotices';

// Protected Route Guard
const ProtectedRoute: React.FC<{
  allowedRoles?: string[];
  children: React.ReactNode;
}> = ({ allowedRoles, children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />

          {/* Root Redirect based on role */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navigate to="/student/dashboard" replace />
              </ProtectedRoute>
            }
          />

          {/* Student Sub-routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="timetable" element={<StudentTimetable />} />
            <Route path="seat" element={<StudentSeat />} />
            <Route path="exams" element={<StudentExams />} />
          </Route>

          {/* Teacher Sub-routes */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="attendance/:sessionId" element={<TeacherAttendanceSession />} />
            <Route path="marks" element={<TeacherMarks />} />
            <Route path="availability" element={<TeacherAvailability />} />
          </Route>

          {/* Admin Sub-routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="classrooms" element={<AdminClassrooms />} />
            <Route path="seating" element={<AdminSeating />} />
            <Route path="substitution" element={<AdminSubstitution />} />
            <Route path="timetable" element={<AdminTimetable />} />
            <Route path="staff" element={<AdminStaff />} />
            <Route path="notices" element={<AdminNotices />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
