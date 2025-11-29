import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { PLACES } from "../data/places.js";

function byId(id) {
  return PLACES.find((p) => p.id === id);
}

function boundsForPlaces(ids) {
  const latlngs = ids.map((id) => [byId(id).lat, byId(id).lng]);
  return L.latLngBounds(latlngs);
}

export default function FitBounds({ ids }) {
  const map = useMap();
  useEffect(() => {
    if (!ids || ids.length === 0) return;
    const b = boundsForPlaces(ids);
    map.fitBounds(b.pad(0.25));
  }, [ids, map]);
  return null;
}
