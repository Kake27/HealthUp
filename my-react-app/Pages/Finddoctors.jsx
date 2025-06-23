// src/components/FindDoctor.jsx

import React, { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import '../CSS/FindDoctors.css';

const dummyDoctors = [
  { id: 1, name: 'Dr. Priya Sharma', specialization: 'Cardiologist', image: 'https://via.placeholder.com/150', description: 'Specialist in heart and blood vessels.' },
  { id: 2, name: 'Dr. Rohit Mehta', specialization: 'Dermatologist', image: 'https://via.placeholder.com/150', description: 'Skin and hair care specialist.' },
  { id: 3, name: 'Dr. Nita Verma', specialization: 'Pediatrician', image: 'https://via.placeholder.com/150', description: 'Expert in child health and wellness.' },
];

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const handleSubmit = e => {
    e.preventDefault();
    const term = query.trim();
    if (term) onSearch(term);
  };
  return (
    <form onSubmit={handleSubmit} className="search-bar">
      <input
        type="text"
        className="search-input"
        placeholder="Search doctors..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <button type="submit" className="search-button">Search</button>
    </form>
  );
}

export default function FindDoctor() {
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedId, setSelectedId] = useState(null);
  const [formOpenId, setFormOpenId] = useState(null);

  const [formData, setFormData] = useState({ date: '', symptoms: '' });
  const [message, setMessage] = useState('');

  const handleSearch = async (keyword) => {
    setSearched(true);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:9000/api/healthcare/patient/search/${encodeURIComponent(keyword)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token
        }
      });
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Search error", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleOptions = doctorUserId => {
    setFormOpenId(null);
    setSelectedId(prev => (prev === doctorUserId ? null : doctorUserId));
    setMessage('');
  };

  const openForm = doctorUserId => {
    setFormOpenId(doctorUserId);
    setSelectedId(null);
    setFormData({ date: '', symptoms: '' });
    setMessage('');
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAppointment = async doctorUserId => {
    const { date, symptoms } = formData;
    if (!date || !symptoms) {
      setMessage('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { id: patientId } = jwtDecode(token);
      const res = await fetch(
        `http://localhost:9000/api/healthcare/patient/book-appointment/${patientId}/${doctorUserId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'auth-token': token
          },
          body: JSON.stringify({ date, symptoms })
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage('Appointment booked successfully!');
        setTimeout(() => setFormOpenId(null), 1500);
      } else {
        setMessage(data.message || 'Booking failed');
      }
    } catch (err) {
      console.error('Booking error:', err);
      setMessage('Server error');
    } finally {
      setLoading(false);
    }
  };

  const doctorsToShow = !searched ? dummyDoctors : results;

  return (
    <div className="find-doctor-page" style={{ padding: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', margin: '2rem 0' }}>
        <h2>Find a Doctor</h2>
        <SearchBar onSearch={handleSearch} />
      </div>

      {loading && searched && <p style={{ textAlign: 'center' }}>Searching…</p>}
      {!loading && searched && doctorsToShow.length === 0 && <p style={{ textAlign: 'center' }}>No doctors found.</p>}
      {!searched && <p style={{ textAlign: 'center' }}>Showing suggested doctors</p>}

      <div className="doctor-card-container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {doctorsToShow.map(doc => {
          const doctorUserId = doc.user?._id || doc._id;
          const name = doc.user?.name || doc.name;
          const specialty = doc.specialization;
          const img = doc.photo
            ? `data:${doc.photo.contentType};base64,${doc.photo.data}`
            : doc.image || 'https://via.placeholder.com/150';
          const desc = doc.description || '';

          return (
            <div className="card doctor-card" style={{ width: 300, margin: 16 }} key={doctorUserId}>
              <img src={img} className="card-img-top" alt={name} />
              <div className="card-body">
                <h5 className="card-title">{name}</h5>
                <h6 className="card-subtitle mb-2 text-muted">{specialty}</h6>
                <p className="card-text">{desc}</p>
                <button className="btn btn-primary" onClick={() => toggleOptions(doctorUserId)}>
                  {selectedId === doctorUserId ? 'Cancel' : 'Book Appointment'}
                </button>

                {selectedId === doctorUserId && (
                  <div className="appointment-options" style={{ marginTop: 8 }}>
                    <button className="btn btn-success" style={{ marginRight: 8 }} onClick={() => {/* through payment */}}>
                      Through Payment
                    </button>
                    <button className="btn btn-secondary" onClick={() => openForm(doctorUserId)}>
                      Without Payment
                    </button>
                  </div>
                )}

                {formOpenId === doctorUserId && (
                  <div className="appointment-form" style={{ marginTop: 8 }}>
                    <input
                      type="date"
                      name="date"
                      className="form-control mb-2"
                      value={formData.date}
                      onChange={handleChange}
                    />
                    <textarea
                      name="symptoms"
                      className="form-control mb-2"
                      rows={3}
                      placeholder="Describe your symptoms"
                      value={formData.symptoms}
                      onChange={handleChange}
                    />
                    {message && <div style={{ color: message.includes('success') ? 'green' : 'red', marginBottom: 8 }}>{message}</div>}
                    <button
                      className="btn btn-success"
                      onClick={() => handleAppointment(doctorUserId)}
                      disabled={loading}
                    >
                      {loading ? 'Booking...' : 'Submit'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

