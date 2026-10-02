import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignupDoctor = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'doctor',
    specialization: '',
    experience: '',
    availableDays: [],
    availableTime: '',
    photo: null,
    consultationFee: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData((f) => ({ ...f, [name]: files[0] }));
    } else {
      setFormData((f) => ({ ...f, [name]: value }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      availableDays: checked
        ? [...prev.availableDays, value]
        : prev.availableDays.filter((d) => d !== value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Build FormData
    const submissionData = new FormData();
    for (const key in formData) {
      if (key === 'availableDays') {
        formData.availableDays.forEach((day) =>
          submissionData.append('availableDays[]', day)
        );
      } else if (key === 'experience' || key === 'consultationFee') {
        // cast numbers to strings
        submissionData.append(key, String(formData[key]));
      } else {
        submissionData.append(key, formData[key]);
      }
    }

    // 🚨 Debug-log every field:
    for (let [field, val] of submissionData.entries()) {
      console.log(field, val);
    }

    try {
      const response = await fetch(
        'http://localhost:9000/api/healthcare/auth/signup-doctor',
        {
          method: 'POST',
          body: submissionData,
        }
      );
      const data = await response.json();
      console.log(data);

      if (response.ok && data.success && data.token) {
        localStorage.setItem('token', data.token);
        navigate('/doctor-dashboard');
      } else {
        alert(data.error || data.message || 'Signup failed.');
      }
    } catch (err) {
      console.error('Error signing up:', err);
      alert('An unexpected error occurred. Please try again later.');
    }
  };

  const days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Name */}
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            type="text"
            className="form-control"
            required
          />
        </div>

        {/* Email */}
        <div className="mb-3">
          <label className="form-label">Email address</label>
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            type="email"
            className="form-control"
            required
          />
        </div>

        {/* Password */}
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            name="password"
            value={formData.password}
            onChange={handleChange}
            type="password"
            className="form-control"
            required
          />
        </div>

        {/* Role */}
        <div className="mb-3">
          <label className="form-label">Role</label>
          <input
            name="role"
            value={formData.role}
            onChange={handleChange}
            type="text"
            className="form-control"
            required
          />
        </div>

        {/* Specialization */}
        <div className="mb-3">
          <label className="form-label">Specialization</label>
          <input
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            type="text"
            className="form-control"
            required
          />
        </div>

        {/* Experience */}
        <div className="mb-3">
          <label className="form-label">Experience (years)</label>
          <input
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            type="number"
            className="form-control"
            required
          />
        </div>

        {/* Available Days */}
        <div className="mb-3">
          <label className="form-label">Available Days</label>
          <div>
            {days.map((d) => (
              <div className="form-check form-check-inline" key={d}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={d}
                  value={d}
                  onChange={handleCheckboxChange}
                  checked={formData.availableDays.includes(d)}
                />
                <label className="form-check-label" htmlFor={d}>
                  {d}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Available Time */}
        <div className="mb-3">
          <label className="form-label">Available Time</label>
          <input
            name="availableTime"
            value={formData.availableTime}
            onChange={handleChange}
            type="text"
            placeholder="e.g., 10:00 AM - 2:00 PM"
            className="form-control"
            required
          />
        </div>

        {/* Photo */}
        <div className="mb-3">
          <label className="form-label">Photo</label>
          <input
            name="photo"
            onChange={handleChange}
            type="file"
            accept="image/*"
            className="form-control"
          
          />
        </div>

        {/* Consultation Fee */}
        <div className="mb-3">
          <label className="form-label">Consultation Fee (₹)</label>
          <input
            name="consultationFee"
            value={formData.consultationFee}
            onChange={handleChange}
            type="number"
            className="form-control"
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">
          Submit
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "200vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
  },
  form: {
    padding: "20px",
    backgroundColor: "white",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    borderRadius: "8px",
    width: "500px"
  }
};
export default SignupDoctor;
