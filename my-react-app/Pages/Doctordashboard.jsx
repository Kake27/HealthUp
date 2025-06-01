import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/Patientdash.css";



const DoctorDashboard = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="dashboard"    style={{ height: "200vh",}}>
      <nav className="navbar">
        <div className="logo">YourApp</div>
      
        <div className="profile-dropdown" ref={dropdownRef} >
           <a
    className="nav-link dropdown-toggle"
    href="#"
    role="button"
    data-bs-toggle="dropdown"
    aria-expanded="false"  style={{paddingRight:"65px"}}>
    Welcome, Dr Piyush
  </a>
<ul className="dropdown-menu"   >
<li>
      <a className="dropdown-item" onClick={() => navigate('/register-doctor')}>
        Today's Appointments
      </a>
    </li>
  

<li>
      <a className="dropdown-item" onClick={() => navigate('/register-doctor')}>
      My Patients
      </a>
    </li>
<li>
      <a className="dropdown-item" onClick={() => navigate('/register-doctor')}>
        Patient's Feedback 
      </a>
    </li><li>
      <a className="dropdown-item" onClick={() => navigate('/register-doctor')}>
        Settings
      </a>
    </li>

</ul>

        </div>
      </nav>

      
    </div>
  );
};

export default DoctorDashboard;
