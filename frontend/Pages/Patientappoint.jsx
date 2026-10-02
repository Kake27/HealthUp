
import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function UpcomingAppointmentsFetch() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchAppointments = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token"); 
        const res = await fetch("http://localhost:9000/api/healthcare/patient/all-appointment", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          signal: controller.signal,
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Server returned ${res.status}: ${text}`);
        }

        const data = await res.json();
        if (data.success) {
          setAppointments(data.appointments || []);
        } else {
          throw new Error(data.message || "Failed to load appointments");
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Fetch error:", err);
          setError(err.message || "Error fetching appointments");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
    return () => controller.abort();
  }, []);

  const statusBadgeClass = (status) => {
    if (!status) return "badge bg-secondary";
    switch (status.toLowerCase()) {
      case "pending":
        return "badge bg-warning text-dark";
      case "completed":
        return "badge bg-success";
      case "cancelled":
      case "cancel":
        return "badge bg-danger";
      default:
        return "badge bg-secondary";
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status"></div>
        <p className="mt-2">Loading upcoming appointments...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-primary">Upcoming Appointments</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {appointments.length === 0 ? (
        <div className="alert alert-info">No upcoming appointments found.</div>
      ) : (
        <div className="row">
          {appointments.map((app) => (
            <div className="col-md-6 col-lg-4 mb-4" key={app._id}>
              <div className="card shadow-sm h-100">
                <div className="card-header bg-primary text-white">
                  {new Date(app.date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  - {app.timeSlot}
                </div>

                <div className="card-body d-flex flex-column">
                  <h5 className="card-title mb-2">
                    {app.doctor?.user?.name || "Doctor"}{" "}
                    <small className="text-muted">({app.doctor?.specialization || "—"})</small>
                  </h5>

                  <ul className="list-group list-group-flush mb-3">
                    <li className="list-group-item">
                      <strong>Fee:</strong> ₹{app.fee}
                    </li>
                    <li className="list-group-item">
                      <strong>Status:</strong>{" "}
                      <span className={statusBadgeClass(app.status)}>{app.status || "—"}</span>
                    </li>
                    <li className="list-group-item">
                      <strong>Paid:</strong> {app.isPaid ? "Yes" : "No"}
                    </li>
                    <li className="list-group-item">
                      <strong>Symptoms:</strong> {app.symptoms || "—"}
                    </li>
                  </ul>

                  <div className="mt-auto">
                    <button className="btn btn-outline-primary btn-sm w-100">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
