import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function InstructionsPanel({ open, onClose, darkMode }) {
  // ESC key closes panel
  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* BACKDROP */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "#000",
              zIndex: 2000,
              cursor: "pointer",
            }}
          />

          {/* CENTERED WRAPPER */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 2001,
              pointerEvents: "none",
            }}
          >
            {/* PANEL */}
            <motion.div
              key="panel"
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 240, damping: 26 }}
              style={{
                pointerEvents: "auto",
                width: "min(520px, 92vw)",
                maxHeight: "88vh",
                overflowY: "auto",
                padding: "22px",
                borderRadius: "14px",
                background: darkMode
                  ? "rgba(15,23,42,0.96)"
                  : "rgba(255,255,255,0.96)",
                color: darkMode ? "#e2e8f0" : "#0f172a",
                border: darkMode
                  ? "1px solid rgba(255,255,255,0.05)"
                  : "1px solid rgba(0,0,0,0.08)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  marginBottom: 10,
                  fontSize: 22,
                  fontWeight: 800,
                  color: darkMode ? "#60a5fa" : "#2563eb",
                }}
              >
                How to Use Campus Navigator
              </h2>

              <p
                style={{
                  marginBottom: 14,
                  fontSize: 14,
                  color: darkMode ? "#94a3b8" : "#475569",
                }}
              >
                This guide explains how to navigate, search buildings, add stops,
                and understand route animations.  
                Tap outside or press <b>ESC</b> to close this panel.
              </p>

              {/* FULL DETAILED INSTRUCTIONS */}
              <ol
                style={{
                  paddingLeft: 18,
                  marginBottom: 18,
                  lineHeight: "1.7",
                  fontSize: 15,
                }}
              >
                <li>
                  <b>Select Start & Destination:</b>  
                  Use the <b>From</b> and <b>To</b> dropdown menus in the sidebar.  
                  This creates your primary route.
                </li>

                <li>
                  <b>Click Any Building Dot on the Map:</b>  
                  When you tap a dot, a popup appears with:  
                  <ul style={{ marginTop: 6 }}>
                    <li><b>Start from here</b></li>
                    <li><b>Reach here</b></li>
                    <li><b>Add via stop</b></li>
                  </ul>
                  Choose one to build your route quickly.
                </li>

                <li>
                  <b>Search for Buildings Easily:</b>  
                  Use the search bar in the sidebar to type building names or nicknames.  
                  When you tap a result, the map jumps to that place automatically.
                </li>

                <li>
                  <b>Add Via (Intermediate) Stops:</b>  
                  You can add one or more stops between your start and end.  
                  All via stops appear as a list in the sidebar, where you can remove them.
                </li>

                <li>
                  <b>Route Animation:</b>  
                  Enable the <b>Show Route Animation</b> toggle to watch a moving dot travel
                  along the path with turn-by-turn instructions.
                </li>

                <li>
                  <b>Distance & Directions:</b>  
                  The sidebar displays total distance and an ordered list of step-by-step
                  navigation hints.
                </li>

                <li>
                  <b>Dark Mode:</b>  
                  Use dark mode for better visibility indoors or at night.  
                  Only the map layer designed for dark mode will be inverted.
                </li>

                <li>
                  <b>Clear Everything:</b>  
                  Press the <b>Clear</b> button to reset start, destination, via stops, 
                  and highlighted route.
                </li>

                <li>
                  <b>View Building Information:</b>  
                  When you click a dot, detailed building info appears in the sidebar,
                  along with latitude & longitude.
                </li>

                <li>
                  <b>Use My Location:</b>  
                  Clicking on the map (if location access is enabled) shows your
                  approximate live position on the map.
                </li>
              </ol>

              <button
                onClick={onClose}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: "pointer",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  width: "100%",
                }}
              >
                Close
              </button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
