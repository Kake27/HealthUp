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
      {/* Blue Navbar */}
      <nav
        className="navbar"
        style={{
          height:"10vh",
          backgroundColor: "#007BFF",
          padding: "10px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "white",
        }}
      >
        <div className="logo" style={{ fontWeight: "bold", fontSize: "20px", color: "white" }}>
          Health Up
        </div>

        <ul className="menu" style={{ listStyle: "none", display: "flex", gap: "20px", margin: 0 }}>
          <li style={{ cursor: "pointer", color: "white" }} onClick={() => navigate("/find-doctors")}>Find Doctors</li>
          <li style={{ color: "white", cursor: "pointer" }}>Video Consult</li>
          <li style={{ color: "white", cursor: "pointer" }}>Surgeries</li>
        </ul>

        <div className="profile-dropdown" ref={dropdownRef}>
          <a
            className="nav-link dropdown-toggle"
            href="#"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ paddingRight: "65px", color: "white" }}
          >
            Welcome, Piyush
          </a>
          {dropdownOpen && (
            <ul className="dropdown-menu show">
              <li>
                <a className="dropdown-item" onClick={() => navigate("/my-appointments")}>
                  My Appointments
                </a>
              </li>
              <li>
                <a className="dropdown-item" onClick={() => navigate("/medicine-orders")}>
                  My Medicine Orders
                </a>
              </li>
              <li>
                <a className="dropdown-item" onClick={() => navigate("/patient-prescription")}>
                  My Prescription Records
                </a>
              </li>
              <li>
                <a className="dropdown-item" onClick={() => navigate("/online-consultations")}>
                  My Feedback
                </a>
              </li>
              <li>
                <a className="dropdown-item" onClick={() => navigate("/feedback")}>
                  Settings
                </a>
              </li>
              <li>
                <a
                  className="dropdown-item"
                  onClick={() => {
                    localStorage.removeItem('token');
                    navigate("/");
                  }}
                >
                  Logout
                </a>
              </li>
            </ul>
          )}
        </div>
      </nav>

      <PatientProfile />
    </div>
  );
};

export default PatientDashboard;
