import React, { useState, useEffect, useContext } from "react";
import CommonContext from "../context/Commoncontext.jsx";
import "../CSS/DoctorAppointments.css";

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
    async function loadAppointments() {
      setLoadingFetch(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_BASE}/api/healthcare/doctor/doctor-appointment`,
          { headers: { "auth-token": token } }
        );
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        if (data.success) {
          setAppointments(data.appointments || []);
        } else {
          throw new Error(data.message || "Failed to load");
        }
      } catch (err) {
        console.error(err);
        setError("Could not load appointments");
        setAppointments([]);
      } finally {
        setLoadingFetch(false);
      }
    }
    loadAppointments();
  }, []);

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

      // Mark appointment completed locally
      console.log(selectedApp.status)
       selectedApp.status="completed";
       console.log(selectedApp.status);
      setAppointments(prev =>
        prev.map(app =>
          app._id === selectedApp._id ? { ...app, status: 'Completed' } : app
        )
      );

     
      alert("Prescription saved");
      setSelectedApp(null);
      setPrescription({
        medicines: [{ name: "", dosage: "", duration: "" }],
        instructions: ""
      });

      // re-fetch appointments
      setLoadingFetch(true);
      const reload = await fetch(
        `${API_BASE}/api/healthcare/doctor/doctor-appointment`,
        { headers: { "auth-token": token } }
      );
      const reloadData = await reload.json();
      setAppointments(reloadData.success ? reloadData.appointments : []);
    } catch (err) {
      console.error(err);
      alert("Error saving prescription");
    } finally {
      setLoadingSubmit(false);
      setLoadingFetch(false);
    }
  };

  const updateMedicine = (idx, field, value) => {
    setPrescription(prev => {
      const meds = [...prev.medicines];
      meds[idx][field] = value;
      return { ...prev, medicines: meds };
    });
  };
  const addMedicineRow = () => {
    setPrescription(prev => ({
      ...prev,
      medicines: [...prev.medicines, { name: "", dosage: "", duration: "" }]
    }));
  };

  if (loadingFetch) return <p>Loading appointments…</p>;
  if (error) return <p className="error">{error}</p>;

  // filter out completed appointments
  const availableApps = appointments.filter(app => app.status !== 'Completed');

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
                <strong>{new Date(app.date).toLocaleDateString()}</strong> — {app.timeSlot}
              </div>
              <div>{app.patient || 'Unknown patient'}</div>
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
              <input
                type="text"
                placeholder="Name"
                value={med.name}
                onChange={e => updateMedicine(i, "name", e.target.value)}
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
              setPrescription(prev => ({ ...prev, instructions: e.target.value }))
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