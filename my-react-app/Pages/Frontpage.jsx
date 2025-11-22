// src/components/Frontpage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Footer.css';

const Frontpage = () => {
  const navigate = useNavigate();

  return (
    <div>
    <div style={styles.container}>
      <nav
        className="navbar navbar-expand-lg fixed-top"
        style={{ backgroundColor: '#007BFF' }}
      >
        <div className="container-fluid">
          <a className="navbar-brand text-white">Health Up</a>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarScroll"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarScroll">
            {/* Left side - Home & Signup */}
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-link text-white" onClick={() => navigate('/Home')}>Home</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white" onClick={() => navigate('/About')}>About</a>
              </li>
            </ul>

            {/* Right side - Login */}
            <ul className="navbar-nav mb-2 mb-lg-0" style={{ margin: '10px' }}>
              <li className="nav-item">
                <a className="nav-link text-white" onClick={() => navigate('/Login')}>Login</a>
              </li>
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle text-white"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Register
                </a>
                <ul className="dropdown-menu" style={{ width: "120px" }}>
                  <li>
                    <a className="dropdown-item" onClick={() => navigate('/register-doctor')}>
                      As a Doctor
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" onClick={() => navigate('/register-patient')}>
                      As a Patient
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>


      <div style={{ marginTop: '100px', textAlign: 'center' }}>
        
        <h1>We Care About Your Health</h1>
        <img
          src="photos\portrait-3d-doctors-hospital-attire.jpg"  
          alt="Front Page Portrait"
          style={{ maxWidth: '100%', height: 'auto', borderRadius: '12px' }}
        />
      </div>




    </div>

      
</div>

  );
};

const Footer = () => {
  return (
    <footer className="footer" style={{ backgroundColor: '#007BFF', color: 'white' }}>
      <div className="container">
        <div className="row">
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><a href="#" style={{ color: 'white' }}>About Us</a></li>
              <li><a href="#" style={{ color: 'white' }}>Our Services</a></li>
              <li><a href="#" style={{ color: 'white' }}>Privacy Policy</a></li>
              <li><a href="#" style={{ color: 'white' }}>Affiliate Program</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Get Help</h4>
            <ul>
              <li><a href="#" style={{ color: 'white' }}>FAQ</a></li>
              <li><a href="#" style={{ color: 'white' }}>Order Status</a></li>
              <li><a href="#" style={{ color: 'white' }}>Payment Options</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Follow us</h4>
            <div className="social-links">
              <a href="#"><i className="fab fa-facebook-f" style={{ color: 'white' }}></i></a>
              <a href="#"><i className="fab fa-twitter" style={{ color: 'white' }}></i></a>
              <a href="#"><i className="fab fa-instagram" style={{ color: 'white' }}></i></a>
              <a href="#"><i className="fab fa-linkedin-in" style={{ color: 'white' }}></i></a>
            </div>
          </div>
        </div>
      </div>
    </footer>
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
    boxShadow: "0 0 10px rgba(7, 8, 3, 0.1)",
    borderRadius: "8px"
  }
};

export { Frontpage, Footer };
