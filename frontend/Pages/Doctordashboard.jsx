import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Commoncontext from "../context/Commoncontext";
import "../CSS/Patientdash.css";
import { jwtDecode } from 'jwt-decode';

const DoctorDashboard = () => {
  const { doctor, refreshdoctor, loading } = useContext(Commoncontext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      if (decoded.role === 'doctor') {
        refreshdoctor();
      } else {
        navigate('/Login');
      }
    }
  }, []);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const photoSrc = doctor?.photo?.data
    ? `data:${doctor.photo.contentType};base64,${doctor.photo.data}`
    : null;

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard" style={{ height: "200vh" }}>
      {/* Navbar */}
      <nav
        className="navbar"
        style={{
          height:"10vh",
          backgroundColor: "#007BFF",
          padding: "10px 20px",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <div className="logo" style={{ fontWeight: "bold", fontSize: "20px", color: "white" }}>
          Health Up
        </div>

        <div className="profile-dropdown" ref={dropdownRef}>
          <a
            className="nav-link dropdown-toggle"
            href="#"
            role="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            style={{ paddingRight: "65px", color: "white" }}
            onClick={toggleDropdown}
          >
            {photoSrc && (
              <img
                src={photoSrc}
                alt="Profile"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  marginRight: 8,
                  objectFit: "cover",
                  verticalAlign: "middle"
                }}
              />
            )}
            Welcome, Dr. {doctor?.user?.name || "Doctor"}
          </a>

          {dropdownOpen && (
            <ul className="dropdown-menu show">
              <li><a className="dropdown-item" onClick={() => navigate("/todays-appointments")}>Today's Appointments</a></li>
              <li><a className="dropdown-item" onClick={() => navigate("/my-patients")}>My Patients</a></li>
              <li><a className="dropdown-item" onClick={() => navigate("/feedback")}>Patient's Feedback</a></li>
              <li><a className="dropdown-item" onClick={() => navigate("/setting")}>Setting</a></li>
              <li><a className="dropdown-item" onClick={() => { localStorage.removeItem('token'); navigate("/") }}>Logout</a></li>
            </ul>
          )}
        </div>
      </nav>

      {/* Doctor Info Card */}
      {doctor && (
        <div className="container mt-5">
          <div
            className="doctor-info-card"
            style={{
              maxWidth: 700,
              margin: "0 auto",
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
              border: "1px solid #e0e0e0",
              display: "flex",
              alignItems: "center",
              gap: "24px"
            }}
          >
            {/* Left Side - Info */}
            <div style={{ flex: 1 }}>
              <h4 style={{ color: "#007BFF", fontWeight: "bold", marginBottom: "16px" }}>
                Dr. {doctor.user?.name}
              </h4>
              <p><strong>Specialization:</strong> <span style={{ color: "#444" }}>{doctor.specialization}</span></p>
              <p><strong>Experience:</strong> <span style={{ color: "#444" }}>{doctor.experience} years</span></p>
              <p><strong>Available:</strong> <span style={{ color: "#444" }}>{doctor.availableDays?.join(", ") || "N/A"} @ {doctor.availableTime}</span></p>
              <p><strong>Consultation Fee:</strong> <span style={{ color: "#28a745", fontWeight: "bold" }}>₹{doctor.consultationFee}</span></p>
              <p><strong>Email:</strong> <span style={{ color: "#555" }}>{doctor.user?.email}</span></p>
            </div>

            {/* Right Side - Photo */}
            {photoSrc && (
              <div>
                <img
                  src={photoSrc}
                  alt="Doctor"
                  style={{
                    width: "150px",
                    height: "150px",
                    objectFit: "cover",
                    borderRadius: "12px",
                    border: "2px solid #007BFF"
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
