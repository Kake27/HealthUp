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
                <Route path="/reset-password" element={<ResetPassword/>} />
                <Route path="/patient-dashboard" element={<PatientDashboard/>} />
                <Route path="/find-doctors" element={<PatientDashboard/>} />
          </Routes>
        </div>

        
        <Footer />
      </Router>
    </div>
  );
}

export default App;
