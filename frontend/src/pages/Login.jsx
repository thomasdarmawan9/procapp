import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(credentials);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (username) => {
    setCredentials({ username, password: 'password123' });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>🏢 Procurement System</h1>
        <h2>Welcome back! Please login to continue.</h2>
        {error && <div className="error-message">⚠️ {error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>👤 Username</label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="form-group">
            <label>🔒 Password</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? '⏳ Logging in...' : '🚀 Login'}
          </button>
        </form>
        <div className="login-info">
          <p><strong>💡 Quick Login:</strong></p>
          <p style={{ marginBottom: '0.5rem', fontSize: '0.85rem', color: '#6b7280' }}>
            Click any user below to auto-fill credentials:
          </p>
          <ul>
            <li onClick={() => quickLogin('user')} style={{ cursor: 'pointer' }}>
              👤 user / password123 <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>(Regular User)</span>
            </li>
            <li onClick={() => quickLogin('superuser')} style={{ cursor: 'pointer' }}>
              ⭐ superuser / password123 <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>(Super User)</span>
            </li>
            <li onClick={() => quickLogin('manager')} style={{ cursor: 'pointer' }}>
              👔 manager / password123 <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>(Manager)</span>
            </li>
            <li onClick={() => quickLogin('director')} style={{ cursor: 'pointer' }}>
              🎯 director / password123 <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>(Director)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;
