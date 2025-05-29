import { useState } from 'react';

const SignupDoctor = () => {
  const [formData, setFormData] = useState({
    specialization: '',
    experience: '',
    availableDays: [],
    availableTime: '',
    photo: null,
    consultationFee: '',
  });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      availableDays: checked
        ? [...prev.availableDays, value]
        : prev.availableDays.filter((day) => day !== value),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Send formData to backend using fetch or axios
    console.log(formData);
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

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
        <label className="form-label">Specialization</label>
        <input type="text" className="form-control" name="specialization" value={formData.specialization} onChange={handleChange} required />
      </div>

      <div className="mb-3">
        <label className="form-label">Experience (in years)</label>
        <input type="number" className="form-control" name="experience" value={formData.experience} onChange={handleChange} required />
      </div>

      <div className="mb-3">
        <label className="form-label">Available Days</label><br />
        {days.map((day) => (
          <div className="form-check form-check-inline" key={day}>
            <input
              type="checkbox"
              className="form-check-input"
              value={day}
              onChange={handleCheckboxChange}
              checked={formData.availableDays.includes(day)}
            />
            <label className="form-check-label">{day}</label>
          </div>
        ))}
      </div>

      <div className="mb-3">
        <label className="form-label">Available Time (e.g., 10:00 AM - 2:00 PM)</label>
        <input type="text" className="form-control" name="availableTime" value={formData.availableTime} onChange={handleChange} />
      </div>

      <div className="mb-3">
        <label className="form-label">Photo</label>
        <input type="file" className="form-control" name="photo" onChange={handleChange} accept="image/*" />
      </div>

      <div className="mb-3">
        <label className="form-label">Consultation Fee (₹)</label>
        <input type="number" className="form-control" name="consultationFee" value={formData.consultationFee} onChange={handleChange} required />
      </div>

      <button type="submit" className="btn btn-primary">Submit</button>
   
      
    </form>
    </div>
  );
};

const styles = {
  container: {
    height: "200vh",
    display: "flex",
    justifyContent: "center",  
    alignItems: "center",      
    backgroundColor: "#f2f2f2",
  },
  form: {
    padding: "20px",
    backgroundColor: "white",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    borderRadius: "8px"
  }
};







export default SignupDoctor;
