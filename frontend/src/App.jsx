import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AddElephant from './pages/AddElephant';
import EditElephant from './pages/EditElephant';
import StressDetector from './pages/StressDetector';
import FoodChain from './pages/FoodChain';
import VisitorLogin from './pages/VisitorLogin';
import VisitorAdminDashboard from './pages/VisitorAdminDashboard';
import VisitorPublicPage from './pages/VisitorPublicPage';
import Navigation from './components/Navigation';
import api from './utils/api';

function AppContent() {
  // null = not yet checked, false = checked & unauthenticated, string = authenticated user
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

  // On mount: restore session from server
  useEffect(() => {
    api.get('/auth/check')
      .then(res => setUser(res.data.user || false))
      .catch(() => setUser(false))
      .finally(() => setAuthChecked(true));
  }, []);

  const handleLogin = (username) => {
    setUser(username);
    // Use setTimeout(0) to let React commit the state update before navigating
    setTimeout(() => navigate('/dashboard'), 0);
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout failed:', err);
    }
    setUser(false);
    setTimeout(() => navigate('/login'), 0);
  };

  // Show nothing until we know auth status (prevents flash of wrong content)
  if (!authChecked) return null;

  return (
    <div className="App">
      <Navigation user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/dashboard" element={<Dashboard onLogout={handleLogout} />} />
        <Route path="/add" element={<AddElephant />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/edit/:id" element={<EditElephant />} />
        <Route path="/stress-detector" element={<StressDetector />} />
        <Route path="/stress-detector/:id" element={<StressDetector />} />
        <Route path="/food-chain" element={<FoodChain />} />
        <Route path="/food-chain/:id" element={<FoodChain />} />
        <Route path="/visitor-login" element={<VisitorLogin />} />
        <Route path="/visitor-admin" element={<VisitorAdminDashboard />} />
        <Route path="/visitor-app" element={<VisitorPublicPage />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
