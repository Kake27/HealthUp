import React, { useState, useEffect, useContext, useRef } from "react";
import CommonContext from "../context/Commoncontext.jsx";
import "../CSS/DoctorAppointments.css";
import MedicineAutocomplete from "./Medicinecomponent.jsx";

const API_BASE = "http://localhost:9000";

export default function DoctorAppointments() {
  const { doctor } = useContext(CommonContext);
  const [appointments, setAppointments] = useState([]);
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [prescription, setPrescription] = useState({
    medicines: [{ name: "", dosage: "", duration: "" }],
    instructions: ""
  });



 

  useEffect(() => {
    const loadAppointments = async () => {
      setLoadingFetch(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/healthcare/doctor/doctor-appointment`, {
          headers: { "auth-token": token }
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Failed to load");
        setAppointments(data.appointments || []);
      } catch (err) {
        console.error(err);
        setError("Could not load appointments");
      } finally {
        setLoadingFetch(false);
      }
    };
    loadAppointments();
  }, []);

  // add a blank row
  const addMedicineRow = () =>
    setPrescription(prev => ({
      ...prev,
      medicines: [...prev.medicines, { name: "", dosage: "", duration: "" }]
    }));

  // update dosage/duration fields
  const updateMedicine = (idx, field, value) =>
    setPrescription(prev => {
      const meds = [...prev.medicines];
      meds[idx][field] = value;
      return { ...prev, medicines: meds };
    });

  //handle selecting a medicine name in row `idx`
  const handleSelectMedicine = (idx, medName) =>
    setPrescription(prev => {
      const meds = [...prev.medicines];
    meds[idx] = {
  ...meds[idx],
  name: medName,
};
      return { ...prev, medicines: meds };
    });

  const submitPrescription = async () => {
    if (!selectedApp?._id) return;
    setLoadingSubmit(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE}/api/healthcare/doctor/prescription/${selectedApp._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": token
          },
          body: JSON.stringify(prescription)
        }
      );
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Save failed");

      // mark completed locally
      setAppointments(prev =>
        prev.map(app =>
          app._id === selectedApp._id
            ? { ...app, status: "Completed" }
            : app
        )
      );
      alert("Prescription saved");
      setSelectedApp(null);
      setPrescription({
        medicines: [{ name: "", dosage: "", duration: "" }],
        instructions: ""
      });
    } catch (err) {
      console.error(err);
      alert("Error saving prescription");
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loadingFetch) return <p>Loading appointments…</p>;
  if (error) return <p className="error">{error}</p>;

  const today = new Date().toISOString().split("T")[0]; 

const availableApps = appointments.filter(app => {
  const appDate = new Date(app.date).toISOString().split("T")[0];
  return app.status !== "Completed" && appDate === today;
});


  return (
    <div className="doctor-appointments-page">
      <h2>Today's Appointments</h2>
      {availableApps.length === 0 ? (
        <p>No appointments for today.</p>
      ) : (
        <ul className="appointments-list">
          {availableApps.map(app => (
            <li
              key={app._id}
              className={selectedApp?._id === app._id ? "selected" : ""}
              onClick={() => {
                setSelectedApp(app);
                setPrescription({
                  medicines: [{ name: "", dosage: "", duration: "" }],
                  instructions: ""
                });
              }}
            >
              <div>
                <strong>{new Date(app.date).toLocaleDateString()}</strong> —{" "}
                {app.timeSlot}
              </div>
              {console.log(app)}
              <div>{app.patient || "Unknown patient"}</div>
            </li>
          ))}
        </ul>
      )}

      {selectedApp && (
        <div className="prescription-form">
          <h3>Prescription for {selectedApp.patient}</h3>

          <label>Medicines:</label>
          {prescription.medicines.map((med, i) => (
            <div key={i} className="medicine-row">
              <MedicineAutocomplete
                onSelect={medName => handleSelectMedicine(i, medName)}
              
              />

              <input
                type="text"
                placeholder="Dosage"
                value={med.dosage}
                onChange={e => updateMedicine(i, "dosage", e.target.value)}
              />
              <input
                type="text"
                placeholder="Duration"
                value={med.duration}
                onChange={e => updateMedicine(i, "duration", e.target.value)}
              />
            </div>
          ))}
          <button type="button" onClick={addMedicineRow} className="btn btn-link">
            + Add another medicine
          </button>

          <label>Additional Instructions:</label>
          <textarea
            value={prescription.instructions}
            onChange={e =>
              setPrescription(prev => ({
                ...prev,
                instructions: e.target.value
              }))
            }
          />

          <div className="form-buttons">
            <button
              onClick={submitPrescription}
              className="btn btn-primary"
              disabled={loadingSubmit}
            >
              {loadingSubmit ? "Saving…" : "Submit Prescription"}
            </button>
            <button
              onClick={() => setSelectedApp(null)}
              className="btn btn-secondary"
              disabled={loadingSubmit}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
