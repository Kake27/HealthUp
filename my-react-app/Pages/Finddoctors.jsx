// src/components/FindDoctor.jsx

import React, { useState,useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import '../CSS/FindDoctors.css';



//////////start
// before you call fetch()
const API_BASE =
  ( typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) ||
  'http://localhost:9000';

const tokenUrli = `${API_BASE}/api/payment/token`;
const checkoutUrli = `${API_BASE}/api/payment/checkout`;

import {dropin} from 'braintree-web-drop-in';
//end



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


//start



// inside FindDoctor component
const dropinInstanceRef = useRef(null);




async function handleThroughPayment(doctorUserId, amount = 250.00){
  setMessage('');
  setLoading(true);

  // dynamic import fallback so we never call create on undefined
  let dropinLib = null;
  try {
    // If you already imported at top: import dropin from 'braintree-web-drop-in';
    // this will use that. Otherwise, dynamically import it (works for Vite/CRA/Next client)
    dropinLib = (typeof dropin !== 'undefined' && dropin) ? dropin : null;
  } catch (e) {
    dropinLib = null;
  }

  if (!dropinLib) {
    try {
      const mod = await import('braintree-web-drop-in');
      dropinLib = mod && (mod.default || mod);
      console.log('dynamic import braintree-web-drop-in', dropinLib);
    } catch (err) {
      console.error('Failed to import braintree-web-drop-in:', err);
      setMessage('Payment library failed to load (see console).');
      setLoading(false);
      return;
    }
  }

  if (!dropinLib || typeof dropinLib.create !== 'function') {
    console.error('dropinLib is missing create():', dropinLib);
    setMessage('Payment UI unavailable (library not loaded).');
    setLoading(false);
    return;
  }

  try {
    // const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:9000';
    // const tokenUrl = `${API_BASE}/api/payment/token`;

    const tokenRes = await fetch(tokenUrli, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'auth-token': localStorage.getItem('token') || '' }
    });

    const tokenText = await tokenRes.text();
    if (!tokenRes.ok) {
      console.error('Token request failed:', tokenRes.status, tokenRes.statusText, tokenText);
      setMessage(`Token request failed: ${tokenRes.status}`);
      setLoading(false);
      return;
    }

    let tokenData;
    try { tokenData = JSON.parse(tokenText); } 
    catch (parseErr) {
      console.error('Token response is not valid JSON:', tokenText);
      setMessage('Invalid token response from server (see console).');
      setLoading(false);
      return;
    }

    const clientToken = tokenData.clientToken;
    if (!clientToken) {
      console.error('No clientToken in response:', tokenData);
      setMessage('No client token received');
      setLoading(false);
      return;
    }

    // Ensure modal + dropin container exist
    let modal = document.getElementById('bt-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'bt-modal';
      Object.assign(modal.style, {
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 2000
      });
      modal.innerHTML = `
        <div id="bt-modal-box" style="background:#fff;padding:16px;border-radius:8px;width:420px;max-width:94%;">
          <h4>Pay ₹${Number(amount).toFixed(2)}</h4>
          <div id="bt-dropin-container" style="margin:12px 0;"></div>
          <div style="display:flex;justify-content:flex-end;gap:8px;">
            <button id="bt-cancel-btn" class="btn btn-secondary">Cancel</button>
            <button id="bt-pay-btn" class="btn btn-primary">Pay ₹${Number(amount).toFixed(2)}</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    // teardown if existing instance
    if (dropinInstanceRef.current) {
      await dropinInstanceRef.current.teardown().catch(() => {});
      dropinInstanceRef.current = null;
      const container = document.getElementById('bt-dropin-container');
      if (container) container.innerHTML = '';
    }

    // create instance using the loaded library
    const instance = await dropinLib.create({
      authorization: clientToken,
      container: '#bt-dropin-container'
    });
    dropinInstanceRef.current = instance;

    // wire up buttons
    const cancelBtn = document.getElementById('bt-cancel-btn');
    const payBtn = document.getElementById('bt-pay-btn');

    const cleanup = async () => {
      try { if (dropinInstanceRef.current) await dropinInstanceRef.current.teardown(); } catch(e) {}
      dropinInstanceRef.current = null;
      const modalEl = document.getElementById('bt-modal');
      if (modalEl) modalEl.remove();
    };

    cancelBtn.onclick = async () => { await cleanup(); setLoading(false); };

    payBtn.onclick = async () => {
      setLoading(true);
      try {
        const payload = await instance.requestPaymentMethod();
        const nonce = payload.nonce;

        // const checkoutUrli = `${API_BASE}/api/payment/checkout`;
        const checkoutRes = await fetch(checkoutUrli, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'auth-token': localStorage.getItem('token') || '' },
          body: JSON.stringify({ paymentMethodNonce: nonce, amount: Number(amount).toFixed(2), doctorUserId })
        });

        const checkoutText = await checkoutRes.text();
        console.log(checkoutText);
        if (!checkoutRes.ok) {
          console.error('Checkout failed:', checkoutRes.status, checkoutRes.statusText, checkoutText);
          setMessage('Payment failed (see console).');
          setLoading(false);
          return;
        }

        let checkoutData;
        try { checkoutData = JSON.parse(checkoutText); } 
        catch (e) {
          console.error('Invalid checkout JSON response:', checkoutText);
          setMessage('Invalid checkout response (see console).');
          setLoading(false);
          return;
        }

        if (checkoutData.success) {
          setMessage(`Payment successful! Txn id: ${checkoutData.transactionId}`);
          await cleanup();
        } else {
          console.error('Checkout returned error:', checkoutData);
          setMessage(checkoutData.error || checkoutData.message || 'Payment failed');
        }
      } catch (err) {
        console.error('payment flow error', err);
        setMessage(err.message || 'Payment failed');
      } finally {
        setLoading(false);
      }
    };

    setLoading(false); // ready for user to click Pay
  } catch (err) {
    console.error('payment init error', err);
    setMessage(err.message || 'Payment initialization failed');
    setLoading(false);
  }
}



////////end











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
                    <button
  className="btn btn-success"
  style={{ marginRight: 8 }}
  onClick={() => handleThroughPayment(doctorUserId, 250.00)} // change amount as needed
  disabled={loading}
>
  {loading ? 'Processing...' : 'Through Payment'}
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
