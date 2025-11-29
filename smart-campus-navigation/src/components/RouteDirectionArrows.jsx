import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-polylinedecorator";

export default function RouteDirectionArrows({ routeLatLngs,darkMode }) {
  const map = useMap();

  useEffect(() => {
    if (!routeLatLngs || routeLatLngs.length < 2) return;

    const decorator = L.polylineDecorator(routeLatLngs, {
    patterns: [
        {
        offset: 10,
        repeat: 40,  
        symbol: L.Symbol.arrowHead({
            pixelSize: 8,
            headAngle: 55,
            polygon: false,    // line arrow, not filled
            pathOptions: {
            color: darkMode ? "#f55e12ff":"#f7990dff",
            weight: 3,
            opacity: 0.9,
            lineCap: "round",
            },
        }),
        },
    ],
    });



    decorator.addTo(map);

    return () => {
      map.removeLayer(decorator);
    };
  }, [routeLatLngs,darkMode, map]);

  return null; // Nothing rendered by React
}

