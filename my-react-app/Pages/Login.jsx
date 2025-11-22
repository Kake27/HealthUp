import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loginData = new FormData();
    for (const key in formData) {
      loginData.append(key, formData[key]);
    }


 for (let [field, val] of loginData.entries()) {
      console.log(field, val);
    }

    try {
      const response = await fetch(
        'http://localhost:9000/api/healthcare/auth/login',
        {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();
      console.log(data);

      if (data.success) {
        localStorage.setItem('token', data.token);
        if (formData.role.toLowerCase() === 'doctor') {
          navigate('/doctor-dashboard');
        } else {
          navigate('/patient-dashboard');
        }
      } else {
        alert(data.error || data.message || 'Login failed.');
      }
    } catch (err) {
      console.error('Error logging in:', err);
      alert('An unexpected error occurred. Please try again later.');
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email address
          </label>
          <input
            name="email"
            type="email"
            className="form-control"
            id="email"
            value={formData.email}
            onChange={handleChange}
            aria-describedby="emailHelp"
          />
          <div id="emailHelp" className="form-text">
            We'll never share your email with anyone else.
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            name="password"
            type="password"
            className="form-control"
            id="password"
            value={formData.password}
            onChange={handleChange}
          />
          <div className="form-text mt-1">
            <a href="/forgot-password" style={{ color: '#0d6efd' }}>
              Forgot Password?
            </a>
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="role" className="form-label">
            Role
          </label>
          <input
            name="role"
            type="text"
            className="form-control"
            id="role"
            value={formData.role}
            onChange={handleChange}
          />
          <div className="form-text">Doctor or Patient</div>
        </div>

        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    height: '200vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  form: {
    padding: '20px',
    backgroundColor: 'white',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    borderRadius: '8px',
  },
};

export default LoginForm;
