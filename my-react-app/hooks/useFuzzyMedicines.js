import { useState, useEffect, useRef } from "react";
const DEFAULT_BASE = "http://localhost:9000/api";

export function useFuzzyMedicines(query) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const cacheRef = useRef(new Map());
  const abortRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // cleanup previous
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }

    if (!query || !query.trim()) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      const q = query.trim();
      if (!q) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      // cache
      if (cacheRef.current.has(q)) {
        console.debug("[useFuzzyMedicines] cache hit:", q, cacheRef.current.get(q));
        setSuggestions(cacheRef.current.get(q));
        setLoading(false);
        return;
      }

      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);

      const url = `${DEFAULT_BASE.replace(/\/$/, "")}/medicines/search/${encodeURIComponent(q)}`;
      console.debug("[useFuzzyMedicines] fetching:", url);

      try {
        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        });

        console.debug("[useFuzzyMedicines] status:", res.status);

        if (!res.ok) {
          const text = await res.text();
          console.warn("[useFuzzyMedicines] non-ok response:", res.status, text);
          setSuggestions([]);
          setLoading(false);
          return;
        }

        // parse
        let data;
        try {
          data = await res.json();
        } catch (err) {
          const raw = await res.text();
          console.warn("[useFuzzyMedicines] JSON parse failed, raw:", raw);
          setSuggestions([]);
          setLoading(false);
          return;
        }

        // allow either ["name", ...] or [{name: "name"}, ...]
        let normalized = [];
        if (Array.isArray(data)) {
          normalized = data.map((x) => {
            if (typeof x === "string") return x;
            if (x && typeof x === "object") return x.name || x.title || x.label || JSON.stringify(x);
            return String(x);
          }).filter(Boolean);
        } else {
          console.warn("[useFuzzyMedicines] unexpected response shape:", data);
          normalized = [];
        }

        console.debug("[useFuzzyMedicines] got suggestions:", normalized);
        cacheRef.current.set(q, normalized);
        setSuggestions(normalized);
      } catch (err) {
        if (err.name === "AbortError") {
          console.debug("[useFuzzyMedicines] aborted fetch for", q);
        } else {
          console.error("[useFuzzyMedicines] fetch error:", err);
        }
        setSuggestions([]);
      } finally {
        setLoading(false);
        abortRef.current = null;
      }
    }, 180); // debounce

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    };
  }, [query]);

  return { suggestions, loading };
}
