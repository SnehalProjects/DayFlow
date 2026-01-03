import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Login.css';

const Login = () => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        loginId,
        password,
      });

      const { token, user, mustChangePassword } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      if (mustChangePassword) {
        // Pass temp password to change password page
        navigate('/change-password', { state: { employeeCode: user.employeeCode, tempPassword: password } });
      } else if (user.role === 'ADMIN' || user.role === 'HR') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="app-title">Human Resource Management System</h1>
        <div className="logo-placeholder">
          <div className="logo-box">
             <span role="img" aria-label="logo">🏢</span>
             <p>App/Web Logo</p>
          </div>
        </div>
        
        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label>Login Id/Email :-</label>
            <div className="input-with-icon">
              <span className="icon">👤</span>
              <input
                type="text"
                placeholder="Enter your ID or Email"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password :-</label>
            <div className="input-with-icon">
              <span className="icon">🔒</span>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="auth-btn">SIGN IN</button>
        </form>

        <p className="auth-footer">
          Don't have an Account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
