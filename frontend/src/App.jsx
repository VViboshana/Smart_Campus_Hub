import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from './context/AuthContext';

// Layouts
import Navbar from './components/layout/Navbar';
import ChatBot from './components/chat/ChatBot';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import OAuth2Redirect from './pages/auth/OAuth2Redirect';

// Main Pages
import Dashboard from './pages/Dashboard';
import Resources from './pages/resources/Resources';
import ResourceDetail from './pages/resources/ResourceDetail';
import CreateResource from './pages/resources/CreateResource';
import Bookings from './pages/bookings/Bookings';
import CreateBooking from './pages/bookings/CreateBooking';
import BookingManagement from './pages/bookings/BookingManagement';
import Tickets from './pages/tickets/Tickets';
import CreateTicket from './pages/tickets/CreateTicket';
import TicketDetail from './pages/tickets/TicketDetail';
import TicketManagement from './pages/tickets/TicketManagement';
import Notifications from './pages/Notifications';
import AdminUsers from './pages/admin/AdminUsers';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && !user.roles?.includes('ADMIN')) return <Navigate to="/" />;

  return children;
};

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer position="top-right" autoClose={3000} />
      {user && <Navbar />}
      {user && <ChatBot />}
      <main className={user ? 'pt-16' : ''}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
          <Route path="/oauth2/redirect" element={<OAuth2Redirect />} />

          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
          <Route path="/resources/:id" element={<ProtectedRoute><ResourceDetail /></ProtectedRoute>} />
          <Route path="/resources/create" element={<ProtectedRoute adminOnly><CreateResource /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
          <Route path="/bookings/create/:resourceId?" element={<ProtectedRoute><CreateBooking /></ProtectedRoute>} />
          <Route path="/bookings/manage" element={<ProtectedRoute adminOnly><BookingManagement /></ProtectedRoute>} />
          <Route path="/tickets" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
          <Route path="/tickets/create" element={<ProtectedRoute><CreateTicket /></ProtectedRoute>} />
          <Route path="/tickets/:id" element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />
          <Route path="/tickets/manage" element={<ProtectedRoute adminOnly><TicketManagement /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
