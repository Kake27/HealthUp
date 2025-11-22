import React, { useState, useRef, useEffect } from "react";
import { useFuzzyMedicines } from "../hooks/useFuzzyMedicines";

export default function MedicineAutocomplete({
  onSelect,
  placeholder = "Type medicine name..."
}) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { suggestions, loading } = useFuzzyMedicines(input);
  const containerRef = useRef();

  //Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // On input change, update text and reopen list
  const handleChange = (e) => {
    setInput(e.target.value);
    setShowSuggestions(true);
  };

  // When you pick one, notify parent, clear input + hide list
  const pick = (med) => {
    if (onSelect) onSelect(med);
    setInput(med);
    setShowSuggestions(false);
  };

  return (
    <div ref={containerRef} style={{ position: "relative", width: 340 }}>
      <input
        type="text"
        placeholder={placeholder}
        value={input}
        onChange={handleChange}
        style={{ width: "100%", padding: 8 }}
      />

      {showSuggestions && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 2147483647
          }}
        >
          {loading && (
            <div style={{ padding: 8, background: "#fff", border: "1px solid #ccc" }}>
              Loading…
            </div>
          )}

          {!loading && input.trim() && suggestions?.length === 0 && (
            <div style={{ padding: 8, background: "#fff", border: "1px solid #ccc" }}>
              No suggestions
            </div>
          )}

          {!loading && suggestions?.length > 0 && (
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                border: "1px solid #ccc",
                background: "#fff",
                maxHeight: 220,
                overflowY: "auto"
              }}
            >
              {suggestions.map((med, idx) => (
                <li
                  key={`${med}-${idx}`}
                  onMouseDown={(e) => {
                    e.preventDefault(); 
                    pick(med);
                  }}
                  style={{
                    padding: 8,
                    cursor: "pointer",
                    borderBottom: "1px solid #eee"
                  }}
                >
                  {med}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
