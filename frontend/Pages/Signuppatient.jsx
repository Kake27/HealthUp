// src/components/SignupPatient.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignupPatient = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    age: '',
    gender: '',
    medicalHistory: '',
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client‑side validation
    const { name, email, password, role, age, gender } = formData;
    if (!name || !email || !password || !role || !age || !gender) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const response = await fetch(
        'http://localhost:9000/api/healthcare/auth/signup-patient',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();
      console.log('Signup response:', data);

      if (response.ok && data.success && data.token) {
        localStorage.setItem('token', data.token);
        navigate('/patient-dashboard');
      } else {
        alert(data.error || data.message || 'Signup failed.');
      }
    } catch (err) {
      console.error('Error signing up:', err);
      alert('An unexpected error occurred. Please try again later.');
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h3>Patient Signup</h3>

        <div className="mb-3">
          <label className="form-label">Name</label>
          <input
            name="name"
            type="text"
            className="form-control"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Email address</label>
          <input
            name="email"
            type="email"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            name="password"
            type="password"
            className="form-control"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        {/* hidden role, still sent in JSON */}
        <input type="hidden" name="role" value="patient" />

        <div className="mb-3">
          <label className="form-label">Age</label>
          <input
            name="age"
            type="number"
            className="form-control"
            value={formData.age}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Gender</label>
          <select
            name="gender"
            className="form-select"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Gender --</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">
            Medical History <small>(separate by commas)</small>
          </label>
          <input
            name="medicalHistory"
            type="text"
            className="form-control"
            value={formData.medicalHistory}
            onChange={handleChange}
            placeholder="e.g., Diabetes, Asthma"
          />
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
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
  },
  form: {
    padding: '20px',
    backgroundColor: 'white',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '400px',
  },
};

export default SignupPatient;
