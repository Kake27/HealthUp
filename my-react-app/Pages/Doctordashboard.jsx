import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Commoncontext from "../context/Commoncontext";
import "../CSS/Patientdash.css";
import { jwtDecode } from 'jwt-decode';
const DoctorDashboard = () => {
  const {doctor, refreshdoctor, loading } = useContext(Commoncontext);
  const [dropdownOpen, setDropdownOpen] = useState(false);

const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log(token);
    if (token) {
       const decoded = jwtDecode(token);
       if(decoded.role==='doctor'){
      refreshdoctor();
       }
     else {
      navigate('/Login');
     }
    }
  }, []);

  const dropdownRef = useRef(null);
  
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
      <nav className="navbar">
        <div className="logo">YourApp</div>

        <div className="profile-dropdown" ref={dropdownRef}>
          <a
            className="nav-link dropdown-toggle"
            href="#"
            role="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            style={{ paddingRight: "65px" }}
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
              <li>
                <a className="dropdown-item" onClick={() => navigate("/todays-appointments")}>
                  Today's Appointments
                </a>
              </li>
              <li>
                <a className="dropdown-item" onClick={() => navigate("/my-patients")}>
                  My Patients
                </a>
              </li>
              <li>
                <a className="dropdown-item" onClick={() => navigate("/feedback")}>
                  Patient's Feedback
                </a>
              </li>
               <li>
                <a className="dropdown-item" onClick={() => navigate("/setting")}>
                  Setting
                </a>
              </li>
              <li>
                <a className="dropdown-item" onClick={() =>{ localStorage.removeItem('token');
                    navigate("/")}}>
                  Logout
                </a>
              </li>
            </ul>
          )}
        </div>
      </nav>

      {doctor && (
        <div className="container mt-4">
          <div className="card" style={{ maxWidth: 600, margin: "0 auto" }}>
            <div className="row g-0">
              {photoSrc && (
                <div className="col-md-4">
                  <img
                    src={photoSrc}
                    className="img-fluid rounded-start"
                    alt="Doctor"
                  />
                </div>
              )}
              <div className={photoSrc ? "col-md-8" : "col-12"}>
                <div className="card-body">
                  <h5 className="card-title">
                    Dr. {doctor.user?.name}
                  </h5>
                  <p className="card-text mb-1">
                    <strong>Specialization:</strong> {doctor.specialization}
                  </p>
                  <p className="card-text mb-1">
                    <strong>Experience:</strong> {doctor.experience} years
                  </p>
                  <p className="card-text mb-1">
                    <strong>Available:</strong>{" "}
                    {doctor.availableDays?.join(", ") || "N/A"} @ {doctor.availableTime}
                  </p>
                  <p className="card-text mb-1">
                    <strong>Consultation Fee:</strong> ₹{doctor.consultationFee}
                  </p>
                  <p className="card-text">
                    <strong>Email:</strong> {doctor.user?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
