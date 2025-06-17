import React, { useContext, useEffect } from 'react';
import CommonContext from "../context/Commoncontext.jsx";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
const PatientProfile = () => {
  const { patient,refreshpatient, loading } = useContext(CommonContext);
const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log(token);
    if (token) {
       const decoded = jwtDecode(token);
       if(decoded.role==='patient'){
      refreshpatient();
       }
     else {
      navigate('/Login');
     }
    }
  }, []);


  if (loading) return <p>Loading profile…</p>;
  
  if (!patient)  return <p>Please log in to see your profile.</p>;

  return (
    <div className="card mb-4" style={{ maxWidth: 500, margin: '20px auto' }}>
      <div className="card-body">
        <h5 className="card-title">{patient.user.name}</h5>
        <p className="card-text"><strong>Email:</strong> {patient.user.email}</p>
        <p className="card-text"><strong>Age:</strong> {patient.age}</p>
        <p className="card-text"><strong>Gender:</strong> {patient.gender}</p>
        {patient.medicalHistory && (
          <p className="card-text">
            <strong>Medical History:</strong> {patient.medicalHistory}
          </p>
        )}
      </div>
    </div>
  );
};

export default PatientProfile;
