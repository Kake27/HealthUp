import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PatientProfile from "./PatientProfile.jsx";
import "../CSS/Patientdash.css";

const PatientDashboard = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="dashboard" style={{ height: "200vh" }}>
      <nav className="navbar">
        <div className="logo">YourApp</div>
        <ul className="menu">
          <li onClick={() => navigate("/find-doctors")}>Find Doctors</li>
          <li>Video Consult</li>
          <li>Surgeries</li>
        </ul>
        <div className="profile-dropdown" ref={dropdownRef}>
          <a
            className="nav-link dropdown-toggle"
            href="#"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ paddingRight: "65px" }}
          >
            Welcome, {/** you can also consume name via context here **/}Piyush
          </a>
          {dropdownOpen && (
            <ul className="dropdown-menu show">
              <li>
                <a
                  className="dropdown-item"
                  onClick={() => navigate("/my-appointments")}
                >
                  My Appointments
                </a>
              </li>
              <li>
                <a
                  className="dropdown-item"
                  onClick={() => navigate("/medicine-orders")}
                >
                  My Medicine Orders
                </a>
              </li>
              <li>
                <a
                  className="dropdown-item"
                  onClick={() => navigate("/medical-records")}
                >
                  My Medical Records
                </a>
              </li>
              <li>
                <a
                  className="dropdown-item"
                  onClick={() => navigate("/online-consultations")}
                >
                  My Online Consultations
                </a>
              </li>
              <li>
                <a
                  className="dropdown-item"
                  onClick={() => navigate("/feedback")}
                >
                  My Feedback
                </a>
              </li>
              <li>
                <a
                  className="dropdown-item"
                  onClick={() => navigate("/settings")}
                >
                  Settings
                </a>
              </li>
            </ul>
          )}
        </div>
      </nav>

      {/* ↓↓↓ Patient profile card ↓↓↓ */}
      <PatientProfile />
    </div>
  );
};

export default PatientDashboard;
