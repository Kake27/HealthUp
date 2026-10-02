// src/ResetPassword.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:9000/api/healthcare/auth/reset-password/${token}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: newPassword }),
        }
      );
      const data = await res.json();

      console.log(data,"FRFRfrfrRRRRRRrrrrrrr");
      if (res.ok) {
        setMessage(data.message || 'Password has been reset successfully.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.error || 'Token is invalid or expired.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h3>Reset Password</h3>

        {/* Hidden username field for accessibility */}
        <input
          type="text"
          name="username"
          autoComplete="username"
          style={{ display: 'none' }}
        />

        <div className="mb-3">
          <label className="form-label">New Password</label>
          <input
            name="newPassword"
            type="password"
            className="form-control"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Confirm New Password</label>
          <input
            name="confirmPassword"
            type="password"
            className="form-control"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Reset Password
        </button>

        {message && <div className="alert alert-success mt-3">{message}</div>}
        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </form>
    </div>
  );
};

const styles = {
  container: {
    marginTop: '50px',
    display: 'flex',
    justifyContent: 'center',
  },
  form: {
    width: '350px',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '10px',
    backgroundColor: '#fff',
  },
};

export default ResetPassword;
