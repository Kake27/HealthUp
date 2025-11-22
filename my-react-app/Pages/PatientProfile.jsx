import React, { useContext, useEffect } from 'react';
import CommonContext from "../context/Commoncontext.jsx";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';

const PatientProfile = () => {
  const { patient, refreshpatient, loading } = useContext(CommonContext);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      if (decoded.role === 'patient') {
        refreshpatient();
      } else {
        navigate('/Login');
      }
    }
  }, []);

  if (loading) return <p>Loading profile…</p>;
  if (!patient) return <p>Please log in to see your profile.</p>;

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "40px" }}>
      <div
        style={{
          backgroundColor: "#ffffff",
          maxWidth: "600px",
          width: "100%",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        <h3 style={{ color: "#007BFF", marginBottom: "20px", fontWeight: "bold" }}>
          👤 Patient Profile
        </h3>

        <p style={infoStyle}>
          <strong style={labelStyle}>👨‍⚕️ Name:</strong> {patient.user.name}
        </p>

        <p style={infoStyle}>
          <strong style={labelStyle}>📧 Email:</strong> {patient.user.email}
        </p>

        <p style={infoStyle}>
          <strong style={labelStyle}>🎂 Age:</strong> {patient.age}
        </p>

        <p style={infoStyle}>
          <strong style={labelStyle}>⚧️ Gender:</strong> {patient.gender}
        </p>

        {patient.medicalHistory && (
          <p style={infoStyle}>
            <strong style={labelStyle}>📜 Medical History:</strong> {patient.medicalHistory}
          </p>
        )}
      </div>
    </div>
  );
};

// Inline styles
const infoStyle = {
  marginBottom: "12px",
  fontSize: "16px",
  color: "#333"
};

const labelStyle = {
  width: "160px",
  display: "inline-block",
  color: "#444"
};

export default PatientProfile;
