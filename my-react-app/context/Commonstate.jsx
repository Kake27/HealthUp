// src/context/Commonstate.jsx
import React, { useState, useEffect } from 'react';
import CommonContext from './Commoncontext.jsx';
const Commonstate = ({ children }) => {
  const API_BASE = 'http://localhost:9000';
  const [doctor, setDoctor] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);


  const refreshdoctor = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setDoctor(null);
      setLoading(false);
      return;
    }
    // Fetch doctor profile
    try {
      const resDoc = await fetch(
        `${API_BASE}/api/healthcare/doctor/getdoctor`,
        {
          method: 'GET',
          headers: { 'auth-token': token }
        }
      );
      const dataDoc = await resDoc.json();
      if (resDoc.ok && dataDoc.success) {
        setDoctor(dataDoc.doctor);
      } else {
        setDoctor(null);
      }
    } catch (err) {
      console.error('Error fetching doctor:', err);
      setDoctor(null);
    }
 setLoading(false);
  }

  const refreshpatient=async ()=>{
    // Fetch patient profile
   setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setPatient(null);
      setLoading(false);
      return;
    }
    try {
      const resPat = await fetch(
        `${API_BASE}/api/healthcare/patient/getpatient`,
        {
          method: 'GET',
          headers: { 'auth-token': token }
        }
      );
      const dataPat = await resPat.json();
      if (resPat.ok && dataPat.success) {
        setPatient(dataPat.patient);
      } else {
        setPatient(null);
      }
    } catch (err) {
      console.error('Error fetching patient:', err);
      setPatient(null);
    }

    setLoading(false);
  };


  return (
    <CommonContext.Provider value={{ doctor, patient, loading, refreshdoctor,refreshpatient }}>
      {children}
    </CommonContext.Provider>
  );
};

export default Commonstate;
