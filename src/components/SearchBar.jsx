import React, { useState, useEffect, useRef } from "react";

export default function SearchBar({
  label,
  places = [],
  darkMode = false,
  onSelect,
  noResultsText = "No matching buildings",
  debounce = 0,
}) {
  const [query, setQuery] = useState("");
  const [showList, setShowList] = useState(false);
  const [filtered, setFiltered] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const wrapperRef = useRef(null);

  /* ----------------- Debounce Search ----------------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      const q = query.toLowerCase();
      setFiltered(
        places.filter((p) =>
          p.name.toLowerCase().includes(q) ||
          p.aliases?.some((a) => a.toLowerCase().includes(q))
        )
      );
    }, debounce);

    return () => clearTimeout(timer);
  }, [query, places, debounce]);

  /* ----------------- Close Dropdown on Outside Click ----------------- */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowList(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (place) => {
    setQuery(place.name);
    onSelect?.(place);
    setShowList(false);
  };

  const inputBg = darkMode ? "#1e293b" : "#ffffff";
  const dropdownBg = darkMode ? "#0f172a" : "#ffffff";
  const textColor = darkMode ? "#e2e8f0" : "#0f172a";

  return (
    <div ref={wrapperRef} style={{ position: "relative", marginBottom: "14px" }}>
      {label && <label style={{ fontWeight: 600 }}>{label}</label>}

      <input
        type="text"
        placeholder="Try typing Basketball..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowList(true);
          setHighlightIndex(-1);
        }}
        onFocus={() => setShowList(true)}
        onKeyDown={(e) => {
          if (!showList) return;

          if (e.key === "ArrowDown") {
            setHighlightIndex((prev) =>
              prev < filtered.length - 1 ? prev + 1 : prev
            );
          }
          if (e.key === "ArrowUp") {
            setHighlightIndex((prev) => (prev > 0 ? prev - 1 : prev));
          }
          if (e.key === "Enter" && highlightIndex >= 0) {
            handleSelect(filtered[highlightIndex]);
          }
        }}
        style={{
          width: "95%",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #cbd5e1",
          background: inputBg,
          color: textColor,
        }}
      />

      {/* ----------------- DROPDOWN ----------------- */}
      {showList && query.length > 0 && (
        <div
          className="search-dropdown"
          style={{
            position: "absolute",
            top: "50px",
            left: 0,
            width: "100%",
            maxHeight: "220px",
            overflowY: "auto",
            background: dropdownBg,
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            zIndex: 1500, // IMPORTANT FIX
          }}
        >
          {filtered.length === 0 && (
            <div style={{ padding: "10px", opacity: 0.6 }}>
              {noResultsText}
            </div>
          )}

          {filtered.map((p, i) => {
            const isActive = i === highlightIndex;

            return (
              <div
                key={p.id}
                onClick={() => handleSelect(p)}
                style={{
                  padding: "10px",
                  cursor: "pointer",
                  background: isActive
                    ? darkMode
                      ? "#1e293b"
                      : "#f1f5f9"
                    : "transparent",
                  borderBottom: darkMode
                    ? "1px solid #1e293b"
                    : "1px solid #f1f5f9",
                  transition: "0.1s",
                }}
              >
                <strong>{p.name}</strong>

                {p.aliases?.length > 0 && (
                  <div style={{ fontSize: "12px", opacity: 0.7 }}>
                    {p.aliases.join(", ")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
