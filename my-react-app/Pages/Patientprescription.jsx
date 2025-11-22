import React, { useEffect, useState } from 'react';

export default function PrescriptionPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);  
  const [formState, setFormState] = useState({});
  const [medicinePrices, setMedicinePrices] = useState({});

  // Your corrected getPrice function
  async function getPrice(medName) {
    try {
      const response = await fetch(`http://localhost:9000/api/medicines/${medName}`);
      const data = await response.json();
      console.log(data.price);
      return parseInt(data.price) || 0;
    } catch (err) {
      console.error(`Error fetching price for ${medName}:`, err);
      return 50;
    }
  }

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(
          'http://localhost:9000/api/healthcare/patient/patient-prescrition',
          { method: 'GET', headers: { 'Content-Type': 'application/json', 'auth-token': token } }
        );
        const text = await res.text();
        if (!res.ok) throw new Error(`API ${res.status}: ${text}`);
        if (text.trim().startsWith('<')) throw new Error('Got HTML instead of JSON');
        const data = JSON.parse(text);
        const prescriptionsData = data.patient_pres || [];
        setPrescriptions(prescriptionsData);

        // Initialize formState
        const initialForms = {};
        prescriptionsData.forEach((p) => {
          initialForms[p._id] = { medicine: '', dosage: '', duration: '' };
        });
        setFormState(initialForms);

        //  Preload prices for all medicines
        const uniqueMedicines = new Set();
        prescriptionsData.forEach((pres) => {
          pres.medicines.forEach((med) => uniqueMedicines.add(med.name));
        });

        const prices = {};
        await Promise.all([...uniqueMedicines].map(async (med) => {
          prices[med] = await getPrice(med);
        }));

        setMedicinePrices(prices);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading…</div>;
  if (error) return <div className="flex items-center justify-center h-screen text-red-600">{error}</div>;
  if (!prescriptions.length)
    return <div className="flex items-center justify-center h-screen text-gray-600">No prescriptions found.</div>;

  const handleBuyNow = (prescriptionId, total) => {
    alert(`Proceed to buy prescription ${prescriptionId} - Total: ₹${total}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen space-y-8">
      <h1 className="text-3xl font-semibold text-center">My Prescriptions</h1>

      {prescriptions.map((pres) => {
        const total = pres.medicines.reduce((sum, med) => {
          const price = medicinePrices[med.name] || 50; // fallback to ₹50
          return sum + price;
        }, 0);

        return (
          <div key={pres._id} className="bg-white border rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold">
                  Prescription on {new Date(pres.createdAt).toLocaleDateString()}
                </h2>
                <p className="text-sm text-gray-500">Instructions: {pres.instructions}</p>
              </div>
            </div>

            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border">
                <thead>
                  <tr className="bg-gray-200 text-left">
                    <th className="px-4 py-2 border">Medicine</th>
                    <th className="px-4 py-2 border">Dosage</th>
                    <th className="px-4 py-2 border">Duration</th>
                    <th className="px-4 py-2 border">Price (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {pres.medicines.map((med) => {
                    const price = medicinePrices[med.name] || 50;
                    return (
                      <tr key={med._id} className="hover:bg-gray-100">
                        <td className="px-4 py-2 border">{med.name}</td>
                        <td className="px-4 py-2 border">{med.dosage}</td>
                        <td className="px-4 py-2 border">{med.duration}</td>
                        <td className="px-4 py-2 border">₹{price}</td>
                      </tr>
                    );
                  })}
                  <tr className="font-semibold bg-gray-100">
                    <td colSpan={3} className="px-4 py-2 border text-right">Total</td>
                    <td className="px-4 py-2 border">₹{total}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="text-right">
              <button
                onClick={() => handleBuyNow(pres._id, total)}
                className="btn btn-primary"
              >
                Buy Now
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
