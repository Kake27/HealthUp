import React, { useState } from "react";
import "../CSS/FindDoctors.css";

const dummyDoctors = [
  {
    id: 1,
    name: "Dr. Priya Sharma",
    specialty: "Cardiologist",
    image: "https://via.placeholder.com/150",
    description: "Specialist in heart and blood vessels."
  },
  {
    id: 2,
    name: "Dr. Rohit Mehta",
    specialty: "Dermatologist",
    image: "https://via.placeholder.com/150",
    description: "Skin and hair care specialist."
  },
  {
    id: 3,
    name: "Dr. Nita Verma",
    specialty: "Pediatrician",
    image: "https://via.placeholder.com/150",
    description: "Expert in child health and wellness."
  }
];

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="search-bar">
      <input
        type="text"
        placeholder="Search doctors..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search-input"
      />
      <button type="submit" className="search-button">Search</button>
    </form>
  );
};

const FindDoctor = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (query) => {
    setSearchTerm(query.toLowerCase());
  };

  const filteredDoctors = dummyDoctors.filter((doc) =>
    doc.name.toLowerCase().includes(searchTerm) ||
    doc.specialty.toLowerCase().includes(searchTerm)
  );

  return (
    <div className="find-doctor-page"   style={{ height: "200vh"}}>
      <h2 style={{ textAlign: "center", marginTop: "20px" }}>Find a Doctor</h2>

      <div style={{ display: "flex", justifyContent: "center", margin: "20px" }}>
        <SearchBar onSearch={handleSearch} />
      </div>

      <div className="doctor-card-container" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
        {filteredDoctors.map((doc) => (
          <div className="card" style={{ width: "18rem", margin: "60px" }} key={doc.id}>
            <img src={doc.image} className="card-img-top" alt={doc.name} />
            <div className="card-body">
              <h5 className="card-title">{doc.name}</h5>
              <h6 className="card-subtitle mb-2 text-muted">{doc.specialty}</h6>
              <p className="card-text">{doc.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FindDoctor;

