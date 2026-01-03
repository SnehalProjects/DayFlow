import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Login.css';

const ChangePassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { employeeCode, tempPassword } = location.state || {};

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (newPassword.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    try {
      await axios.post('http://localhost:5000/api/auth/change-password', {
        employeeCode,
        currentPassword: tempPassword,
        newPassword,
      });

      // After successful change, redirect to dashboard
      const user = JSON.parse(localStorage.getItem('user'));
      if (user.role === 'ADMIN' || user.role === 'HR') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating password');
    }
  };

  if (!employeeCode) {
    return <div className="p-10">Invalid session. Please login again.</div>;
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="app-title">Change Password</h1>
        <p className="subtitle">First time login detected. Please set a new password.</p>
        
        <form onSubmit={handleChangePassword} className="auth-form">
          <div className="form-group">
            <label>New Password :-</label>
            <div className="input-with-icon">
              <span className="icon">🔒</span>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Confirm New Password :-</label>
            <div className="input-with-icon">
              <span className="icon">🔄</span>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="auth-btn">UPDATE PASSWORD</button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
