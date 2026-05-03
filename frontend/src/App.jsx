import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import TransactionsPage from './pages/TransactionsPage';
import Navigation from './components/Navigation';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

function App() {
  const { user } = useAuth();

  return (
    <div className="app-container">
      {user && <Navigation />}
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/signup" element={user ? <Navigate to="/" /> : <SignupPage />} />
        <Route path="/dashboard" element={<Navigate to="/" />} />
        <Route path="/wallet" element={<Navigate to="/transactions" />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/transactions" 
          element={
            <ProtectedRoute>
              <TransactionsPage />
            </ProtectedRoute>
          } 
        />
        {/* Catch-all to redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

    </div>
  );
}


export default App;
