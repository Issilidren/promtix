import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.jsx';
import Landing from './pages/Landing.jsx';
import AuthCallback from './pages/AuthCallback.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Solo from './pages/Solo.jsx';
import PvP from './pages/PvP.jsx';
import Coop from './pages/Coop.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import Shop from './pages/Shop.jsx';
import CharacterCreation from './pages/CharacterCreation.jsx';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-game-bg">
        <div className="neon-cyan text-sm font-mono animate-pulse">&gt; sys.init...</div>
      </div>
    );
  }
  return user ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/dashboard"         element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/character-creation" element={<ProtectedRoute><CharacterCreation /></ProtectedRoute>} />
      <Route path="/solo"              element={<ProtectedRoute><Solo /></ProtectedRoute>} />
      <Route path="/pvp"               element={<ProtectedRoute><PvP /></ProtectedRoute>} />
      <Route path="/coop"              element={<ProtectedRoute><Coop /></ProtectedRoute>} />
      <Route path="/leaderboard"       element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
      <Route path="/shop"              element={<ProtectedRoute><Shop /></ProtectedRoute>} />
    </Routes>
  );
}
