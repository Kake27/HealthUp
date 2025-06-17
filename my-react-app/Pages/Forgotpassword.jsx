import React, { useState } from 'react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const res = await fetch('http://localhost:9000/api/healthcare/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h3>Forgot Password</h3>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Enter your registered email
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Send Reset Link
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

export default ForgotPassword;
