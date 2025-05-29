import React, { useState } from 'react';

const LoginForm = () => {
  const [username, setUsername] = useState('4mtjjG');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your form submission logic here
    console.log('Submitted username:', username);
  };

  return (


 <div style={styles.container}>
  <form style={styles.form}>
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
      {/* 👇 Forgot Password link */}
      <div className="form-text mt-1">
        <a href="/forgot-password" style={{ color: '#0d6efd' }}>
          Forgot Password?
        </a>
      </div>
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

    <button type="submit" className="btn btn-primary">
      Submit
    </button>
  </form>
</div>



  );
};


const styles = {
  container: {
    height: "100vh",
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











export default LoginForm;
