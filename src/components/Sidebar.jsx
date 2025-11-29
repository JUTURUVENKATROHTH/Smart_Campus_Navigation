import React from "react";
import SearchBar from "./SearchBar";

export default function Sidebar({
  fromId,
  toId,
  namedPlaces,
  routeMeters,
  routeSteps,
  showRouteAnimation,
  setShowRouteAnimation,
  setFromId,
  setToId,
  handleClear,
  handleFind,
  selectedPlace,
  setSelectedPlace,
  darkMode,
  temperature,
  setDarkMode,
  loadingTemp,
  viaPoints,
  setViaPoints,
  setShowInstructions,
  highlightedPlaceId,
  setHighlightedPlaceId,
}) {
  function formatDistance(meters) {
    if (!isFinite(meters)) return "-";
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(2)} km`;
  }

  return (
    <aside className="sidebar">
      <div style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "50px",
        marginBottom: "10px"
      }}>
        <div>
          <h1 className="title">Campus Navigator</h1>
          <p className="subtitle">Where do you want to go today?</p>
        </div>
        <button
          className="btn-secondary"
          style={{ marginTop: "8px" }}
          onClick={() => setShowInstructions(true)}
        >
          HELP
        </button>
      </div>

      {/* Dark Mode Toggle */}
      <div style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "8px",
        marginBottom: "10px"
      }}>
        <button
          onClick={() => setDarkMode(prev => !prev)}
          className="btn-secondary"
          style={{ marginTop: "8px" }}
        >
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>

        <label
          style={{
            fontSize: "14px",
            color: darkMode ? "#e2e8f0" : "#334155",
            display: "block",        
            marginBottom: "6px", 
            lineHeight: "18px",
          }}
        >
          Temp: {loadingTemp ? "Loading..." : `${temperature}°C`}
        </label>

      </div>
      <div style={{ position: "relative", zIndex: 1500}}>
        <SearchBar
          label="Search Building"
          places={namedPlaces}
          darkMode={darkMode}
          onSelect={(place) => {
            setSelectedPlace(place);
            setHighlightedPlaceId(place.id);
            window.dispatchEvent(
              new CustomEvent("jumpToLocation", { detail: place })
            );
          }}
        />
      </div>



      {/* FROM */}
      <label>From</label>
      <select value={fromId || ""} onChange={(e) => setFromId(e.target.value)}>
        <option value="" disabled>Select start point</option>
        {namedPlaces.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      {/* TO */}
      <label>To</label>
      <select value={toId || ""} onChange={(e) => setToId(e.target.value)}>
        <option value="" disabled>Select destination</option>
        {namedPlaces.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      {/* VIA STOPS LIST */}
      {viaPoints?.length > 0 && (
        <div className="info-card">
          <h3>Via Stops</h3>
          <ul>
            {viaPoints.map((id, idx) => {
              const p = namedPlaces.find(n => n.id === id);
              return (
                <li key={idx} style={{ marginBottom: "6px" }}>
                  {p?.name || id}

                  <button
                    style={{
                      marginLeft: "8px",
                      padding: "2px 6px",
                      fontSize: "12px",
                      cursor: "pointer",
                      borderRadius: "4px",
                      border: "none",
                      background: "#dc2626",
                      color: "white"
                    }}
                    onClick={() => {
                      const updated = viaPoints.filter(v => v !== id);
                      setViaPoints(updated);
                      // Recalculate the route immediately
                      handleFind(fromId, toId, updated);
                    }}
                  >
                    ✖
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {/* CLEAR BUTTON */}
      <div className="btn-group">
        <button className="btn-secondary" onClick={handleClear}>Clear</button>
      </div>
      {/* SELECTED BUILDING INFO */}
      {selectedPlace ? (
        <div className="info-card">
          <div className="info-header">
            <h3>{selectedPlace.name}</h3>
            <button
              className="close"
              onClick={() => setSelectedPlace(null)}
            >
              ✖
            </button>
          </div>

          <p>{selectedPlace.info || "No additional information available."}</p>

          <div className="coords">
            📍 {selectedPlace.lat.toFixed(6)}, {selectedPlace.lng.toFixed(6)}
          </div>
        </div>
      ) : (
        <div className="help-card">
          Click a dot on the map to see building info here.
        </div>
      )}
      {/* SHOW ANIMATION */}
      <label className="toggle-row">
        <input
          type="checkbox"
          checked={showRouteAnimation}
          onChange={(e) => setShowRouteAnimation(e.target.checked)}
        />
        <span>Show route animation</span>
      </label>

      {/* ROUTE INFO */}
      <div className="route-info">
        <p>
          <strong>Distance:</strong> {formatDistance(routeMeters)}
        </p>
        <details open={routeSteps.length > 0}>
          <summary>Directions</summary>
          <ol>
            {routeSteps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </details>
      </div>

    </aside>
  );
}
