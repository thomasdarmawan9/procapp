import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleIcon = {
    user: '👤',
    superuser: '⭐',
    manager: '👔',
    director: '🎯'
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            🏢 Procurement System
          </Link>
          <div className="nav-menu">
            <Link to="/" className="nav-link">📊 Dashboard</Link>
            <Link to="/requests/new" className="nav-link">➕ New Request</Link>
            <Link to="/vendors" className="nav-link">🏢 Vendors</Link>
            <div className="user-info">
              <span>
                {roleIcon[user?.role] || '👤'} {user?.full_name}
              </span>
              <button onClick={handleLogout} className="btn-logout">🚪 Logout</button>
            </div>
          </div>
        </div>
      </nav>
      <main className="main-content">{children}</main>
    </div>
  );
};

export default Layout;
