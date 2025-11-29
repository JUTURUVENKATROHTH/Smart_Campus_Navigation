import { Marker } from "react-leaflet";
import L from "leaflet";
import { PLACES } from "../data/places.js";

function byId(id) {
  return PLACES.find((p) => p.id === id);
}

export default function FloatingStepMarkers({ routeIds, routeSteps }) {
  return (
    <>
      {routeIds.map((id, i) => {
        const p = byId(id);
        const text = routeSteps[i] || "";
        const html = `<div class="floating-step">${text.replace(/</g, "&lt;")}</div>`;
        return (
          <Marker
            key={`fs-${id}-${i}`}
            position={[p.lat, p.lng]}
            icon={L.divIcon({
              className: "floating-step-wrapper",
              html,
              iconSize: [160, 36],
              iconAnchor: [80, -10],
            })}
            interactive={false}
          />
        );
      })}
    </>
  );
}
