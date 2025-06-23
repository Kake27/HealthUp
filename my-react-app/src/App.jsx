import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Frontpage, Footer } from '../Pages/Frontpage.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import LoginForm from '../Pages/Login.jsx';
import SignupDoctor from '../Pages/Signupdoctor.jsx';
import SignupPatient from '../Pages/Signuppatient.jsx';
import ForgotPassword from '../Pages/Forgotpassword.jsx';
import ResetPassword from '../Pages/Resetpassword.jsx';
import PatientDashboard from '../Pages/Patientdashboard.jsx';
import FindDoctor from '../Pages/Finddoctors.jsx';
import DoctorDashboard from '../Pages/Doctordashboard.jsx';
import DoctorAppointments from '../Pages/Doctorappoint.jsx';
function App() {
  return (
    <div className="App">
      <Router>
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Frontpage />} />
            <Route path="/Login" element={<LoginForm/>} />
            <Route path="/register-doctor" element={<SignupDoctor/>} />
               <Route path="/register-patient" element={<SignupPatient/>} />
                <Route path="/forgot-password" element={<ForgotPassword/>} />
                <Route path="/reset-password/:token" element={<ResetPassword/>} />
                <Route path="/patient-dashboard" element={<PatientDashboard/>} />
                <Route path="/doctor-dashboard" element={<DoctorDashboard/>} />
                <Route path="/find-doctors" element={<FindDoctor/>} />
                 <Route path="/todays-appointments" element={<DoctorAppointments/>} />
          </Routes>
        </div>

        
        <Footer />
      </Router>
    </div>
  );
}

export default App;
