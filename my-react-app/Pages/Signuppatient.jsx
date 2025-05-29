import { useState } from 'react';

const SignupPatient = () => {
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    medicalHistory: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Convert medicalHistory string (comma-separated) to array
    const payload = {
      ...formData,
      medicalHistory: formData.medicalHistory
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item !== ''),
    };

    console.log('Submit Payload:', payload);

    // You can send `payload` using axios or fetch
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div className="mb-3">
      <label htmlFor="exampleInputEmail1" className="form-label">
        Email address
      </label>
      <input
        type="email"
        className="form-control"
        id="exampleInputEmail1"
        aria-describedby="emailHelp"
      />
      <div id="emailHelp" className="form-text">
        We'll never share your email with anyone else.
      </div>
    </div>

    <div className="mb-3">
      <label htmlFor="exampleInputPassword1" className="form-label">
        Password
      </label>
      <input
        type="password"
        className="form-control"
        id="exampleInputPassword1"
      />
    </div>

    <div className="mb-3">
      <label htmlFor="exampleInputRole1" className="form-label">
        Role
      </label>
      <input
        type="text"
        className="form-control"
        id="exampleInputRole1"
      />
      <div className="form-text">Doctor or Patient</div>
    </div>

    
        <div className="mb-3">
          <label className="form-label">Age</label>
          <input
            type="number"
            className="form-control"
            name="age"
            value={formData.age}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Gender</label>
          <select
            className="form-select"
            name="gender"
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
            type="text"
            className="form-control"
            name="medicalHistory"
            value={formData.medicalHistory}
            onChange={handleChange}
            placeholder="e.g., Diabetes, Asthma"
          />
        </div>

        <button type="submit" className="btn btn-primary">Submit</button>
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
    backgroundColor: '#f2f2f2',
  },
  form: {
    padding: '20px',
    backgroundColor: 'white',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '400px'
  }
};

export default SignupPatient;
