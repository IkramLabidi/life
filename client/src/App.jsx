import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import Spinner from './components/ui/Spinner.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Finances from './pages/Finances.jsx';
import Planner from './pages/Planner.jsx';
import Health from './pages/Health.jsx';
import Study from './pages/Study.jsx';
import CalendarPage from './pages/Calendar.jsx';
import Goals from './pages/Goals.jsx';
import Journal from './pages/Journal.jsx';
import Reports from './pages/Reports.jsx';
import Settings from './pages/Settings.jsx';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Spinner label="Loading your workspace…" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const PublicOnly = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Spinner />
      </div>
    );
  }
  if (user) return <Navigate to="/" replace />;
  return children;
};

const App = () => (
  <Routes>
    <Route
      path="/login"
      element={
        <PublicOnly>
          <Login />
        </PublicOnly>
      }
    />
    <Route
      path="/register"
      element={
        <PublicOnly>
          <Register />
        </PublicOnly>
      }
    />

    <Route
      path="/"
      element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Dashboard />} />
      <Route path="finances" element={<Finances />} />
      <Route path="planner" element={<Planner />} />
      <Route path="health" element={<Health />} />
      <Route path="study" element={<Study />} />
      <Route path="calendar" element={<CalendarPage />} />
      <Route path="goals" element={<Goals />} />
      <Route path="journal" element={<Journal />} />
      <Route path="reports" element={<Reports />} />
      <Route path="settings" element={<Settings />} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
