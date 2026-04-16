import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, RequireAuth, RequireAdmin } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import Repertoire from './pages/Repertoire';
import Journey from './pages/Journey';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Booking from './pages/Booking';
import Appointments from './pages/Appointments';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminSlots from './pages/AdminSlots';
import AdminMembers from './pages/AdminMembers';
import AdminMessages from './pages/AdminMessages';
import Messages from './pages/Messages';
import ScrollToHash from './components/ScrollToHash';
import Layout from './components/Layout';

function App() {
  return (
    <HelmetProvider>
      <Router basename="/">
        <AuthProvider>
          <ToastProvider>
            <ScrollToHash />
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="portfolio" element={<Portfolio />} />
                <Route path="repertoire" element={<Repertoire />} />
                <Route path="journey" element={<Journey />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
                <Route path="booking" element={<RequireAuth><Booking /></RequireAuth>} />
                <Route path="appointments" element={<RequireAuth><Appointments /></RequireAuth>} />
                <Route path="profile" element={<RequireAuth><Profile /></RequireAuth>} />
                <Route path="messages" element={<RequireAuth><Messages /></RequireAuth>} />
                <Route path="admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
                <Route path="admin/slots" element={<RequireAdmin><AdminSlots /></RequireAdmin>} />
                <Route path="admin/members" element={<RequireAdmin><AdminMembers /></RequireAdmin>} />
                <Route path="admin/messages" element={<RequireAdmin><AdminMessages /></RequireAdmin>} />
              </Route>
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </Router>
    </HelmetProvider>
  );
}

export default App;
