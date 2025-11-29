// src/components/MapView.jsx
import React, { useState, useEffect, useRef } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Polyline,
    LayersControl,
    useMapEvents,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import { PLACES } from "../data/places.js";
import { PATHS } from "../data/paths.js";
import FitBounds from "./FitBounds.jsx";
import RouteDirectionArrows from "./RouteDirectionArrows.jsx";

// import FloatingStepMarkers from "./FloatingStepMarkers.jsx";

const { BaseLayer } = LayersControl;
const StartIcon = new L.DivIcon({
    html: `<div style="
    width:14px;
    height:14px;
    background:#16a34a;
    border-radius:50%;
    border:2px solid #fff;
    box-shadow:0 0 8px rgba(22,163,74,0.6);
  "></div>`,
    className: "",
    iconSize: [14, 14],
    iconAnchor: [7, 7],
});

const ViaIcon = new L.DivIcon({
    html: `<div style="
    width:14px;
    height:14px;
    background:#facc15;
    border-radius:50%;
    border:2px solid #fff;
    box-shadow:0 0 8px rgba(22,163,74,0.6);
  "></div>`,
    className: "",
    iconSize: [2, 2],
    iconAnchor: [1, 1],
});

const EndIcon = new L.DivIcon({
    html: `<div style="
    width:14px;
    height:14px;
    background:#dc2626;
    border-radius:50%;
    border:2px solid #fff;
    box-shadow:0 0 8px rgba(220,38,38,0.6);
  "></div>`,
    className: "",
    iconSize: [2, 2],
    iconAnchor: [1, 1],
});

/* --- building dot icon --- */
const DotIcon = new L.DivIcon({
    className: "custom-dot-marker",
    html: `<div class="dot"></div>`,
    iconSize: [2, 2],
    iconAnchor: [1, 1],
});

/* --- Traveller (blue dot) --- */
const TravellerIcon = new L.DivIcon({
    className: "traveller-icon",
    html: `<div style="
    width:16px;height:16px;border-radius:50%;
    background:#00b4d8;border:2px solid white;
    box-shadow:0 0 10px rgba(0,180,216,0.9);
  "></div>`,
    iconSize: [2, 2],
    iconAnchor: [1, 1],
});

/* --- Location button --- */
function MyLocationButton() {
    const [position, setPosition] = useState(null);
    const map = useMapEvents({
        click() {
            map.locate();
        },
        locationfound(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, 17);
        },
    });

    return position ? (
        <Marker
            position={position}
            icon={L.divIcon({
                html: `<div style="
          width:14px;height:14px;background:#00b4d8;
          border:2px solid white;border-radius:50%;
          box-shadow:0 0 10px rgba(0,180,216,0.7);
        "></div>`,
                className: "",
                iconSize: [14, 14],
            })}
        />
    ) : null;
}

/* --- Route animation with Play / Pause and Directions --- */
function RouteAnimation({ routeLatLngs, routeSteps }) {
    const [playing, setPlaying] = useState(false);
    const [currentStep, setCurrentStep] = useState("");
    const markerRef = useRef(null);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (!routeLatLngs || routeLatLngs.length < 2) return;

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (!playing) return;
        let stepIndex = 0;
        setCurrentStep(routeSteps[0] || "Starting route...");
        intervalRef.current = setInterval(() => {
            stepIndex++;

            if (stepIndex >= routeSteps.length) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
                setPlaying(false);
                setCurrentStep("You have arrived at your destination");
                return;
            }
            const posIndex = Math.floor(
                (stepIndex / (routeSteps.length - 1)) * (routeLatLngs.length - 1)
            );
            if (markerRef.current && routeLatLngs[posIndex]) {
                markerRef.current.setLatLng(routeLatLngs[posIndex]);
            }

            // update visible text
            if (routeSteps[stepIndex]) {
                setCurrentStep(routeSteps[stepIndex]);
            }
        }, 2000); // 2s per step = slower & smoother

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [routeLatLngs, playing, routeSteps]);

    if (!routeLatLngs || routeLatLngs.length < 2) return null;

    return (
        <>
            {/* Blue moving dot */}
            <Marker
                ref={markerRef}
                position={routeLatLngs[0]}
                icon={L.divIcon({
                    html: `
            <div style="
              width:16px;
              height:16px;
              border-radius:50%;
              background:#00b4d8;
              border:2px solid white;
              box-shadow:0 0 12px rgba(0,180,216,0.8);
            "></div>
          `,
                    className: "",
                    iconSize: [16, 16],
                    iconAnchor: [8, 8],
                })}
                interactive={false}
            />

            {/* Top-left direction box */}
            {currentStep && (
                <div
                    style={{
                        position: "absolute",
                        top: "20px",
                        left: "20px",
                        background: "rgba(37,99,235,0.96)",
                        color: "white",
                        padding: "10px 16px",
                        borderRadius: "12px",
                        fontSize: "14px",
                        boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
                        zIndex: 1000,
                        maxWidth: "280px",
                        lineHeight: "1.4",
                    }}
                >
                    {currentStep}
                </div>
            )}

            {/* Bottom-left play/pause button */}
            <div
                style={{
                    position: "absolute",
                    bottom: "20px",
                    left: "20px",
                    zIndex: 1000,
                }}
            >
                <button
                    onClick={() => setPlaying((p) => !p)}
                    style={{
                        background: playing ? "#ef4444" : "#2563eb",
                        color: "white",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "14px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                    }}
                >
                    {playing ? "Pause" : "Play"}
                </button>
            </div>
        </>
    );
}

function MapEventsHelper({ searchSelectedPlace }) {
    const map = useMap();

    useEffect(() => {
        if (!searchSelectedPlace) return;

        map.flyTo([searchSelectedPlace.lat, searchSelectedPlace.lng], 18, {
            animate: true,
            duration: 1.3
        });

    }, [searchSelectedPlace, map]);

    return null;
}
function JumpToLocationHelper({ setSelectedPlace }) {
    const map = useMap();

    useEffect(() => {
        function handleJump(e) {
            const place = e.detail;
            map.flyTo([place.lat, place.lng], 18, {
                animate: true,
                duration: 1.2,
            });
            setSelectedPlace(place);
        }

        window.addEventListener("jumpToLocation", handleJump);
        return () => window.removeEventListener("jumpToLocation", handleJump);
    }, [map]);

    return null;
}

/* -------------------- MAIN MAP COMPONENT -------------------- */
export default function MapView({
    namedPlaces,
    routeLatLngs,
    routeIds,
    showFloatingSteps,
    showRouteAnimation,
    routeSteps,
    setSelectedPlace,
    fromId,
    toId,
    setFromId,
    setToId,
    handleFind,
    darkMode,
    viaPoints,
    setViaPoints,
    searchSelectedPlace,
    setSearchSelectedPlace,
    highlightedPlaceId
}) {
    const networkLines = PATHS.map(([a, b], i) => {
        const A = PLACES.find((p) => p.id === a);
        const B = PLACES.find((p) => p.id === b);
        return { key: i, points: [[A.lat, A.lng], [B.lat, B.lng]] };
    });



    const HighlightIcon = new L.DivIcon({
        html: `
            <div style="
            width:20px;
            height:20px;
            border-radius:50%;
            background:#FFA500;
            border:3px solid white;
            box-shadow:0 0 18px rgba(246, 190, 59, 0.9);
            "></div>`,
        className: "",
        iconSize: [20, 20],
        iconAnchor: [10, 10],
    });

    const center = { lat: 10.805, lng: 76.728 };

    return (
        <MapContainer
            center={center}
            zoom={17}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
        >
            <LayersControl position="topright">
                <LayersControl.BaseLayer checked={!darkMode} name="OpenStreetMap">
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
                    />
                </LayersControl.BaseLayer>

                <LayersControl.BaseLayer checked={darkMode} name="OpenStreetMap">
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        className="dark_only"
                    />

                </LayersControl.BaseLayer>


                <LayersControl.BaseLayer name="Esri Satellite">
                    <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        attribution='&copy; <a href="www.arcgis.com">Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, swisstopo, and the GIS User Community</a>'
                        tileClassName="satellite"
                    />
                </LayersControl.BaseLayer>

            </LayersControl>
            <JumpToLocationHelper setSelectedPlace={setSelectedPlace} />

            <MapEventsHelper searchSelectedPlace={searchSelectedPlace} />

            <MyLocationButton />

            {/* Base path lines */}
            {networkLines.map((l) => (
                <Polyline
                    key={l.key}
                    positions={l.points}
                    color="#cbd5e1"
                    weight={2}
                    dashArray="6"
                />
            ))}

            {/* Named markers */}
            {namedPlaces.map((p) => {
                let icon = DotIcon;
                if (p.id === highlightedPlaceId) {
                    icon = HighlightIcon;
                }
                else if (p.id === fromId) icon = StartIcon;
                else if (p.id === toId) icon = EndIcon;

                return (
                    <Marker
                        key={p.id}
                        position={[p.lat, p.lng]}
                        icon={icon}
                        eventHandlers={{
                            click: (e) => {
                                setSelectedPlace(p);
                                const popup = L.popup().setLatLng(e.latlng)
                                    .setContent(`
                        <div style="
      font-family: Inter, sans-serif;
      padding: 10px;
      max-width: 260px;
      color: #0f172a;
      line-height: 1.25;
    ">
      <div style= display:flex; align-items:center; justify-content:space-between;">
        <div style="min-width:0">
           <strong style="
      font-size: 13px;
      display:block;
      white-space:nowrap;
      overflow:hidden;
      text-overflow:ellipsis;
      color:#1e293b;
    ">  ${p.name || "Unnamed Location"}</strong>
          ${p.address ? `<div style="font-size:12px;color:#475569; margin-top:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.address}</div>` : ''}
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">
        <button id="setStart" style="
          background:#16a34a;
          color:#fff;
          border:none;
          padding:9px 12px;
          width:100%;
          border-radius:10px;
          cursor:pointer;
          font-weight:600;
          font-size:13px;
        ">Start from here</button>

        <button id="addVia" style="
            background:#facc15;
            color:#111;
            border:none;
            padding:9px 12px;
            width:100%;
            border-radius:10px;
            cursor:pointer;
            font-weight:600;
            font-size:13px;
        ">Add Via Stop</button>

        <button id="setEnd" style="
          background:#dc2626;
          color:#fff;
          border:none;
          padding:9px 12px;
          width:100%;
          border-radius:10px;
          cursor:pointer;
          font-weight:600;
          font-size:13px;
        ">Reach here</button>
      </div>

     
    </div>
  ` ).openOn(e.target._map);
                                setTimeout(() => {
                                    document.getElementById("setStart").onclick = () => {
                                        const newFrom = p.id;
                                        setFromId(newFrom);
                                        e.target._map.closePopup();
                                        handleFind(newFrom, toId, viaPoints);
                                    };

                                    document.getElementById("setEnd").onclick = () => {
                                        const newTo = p.id;
                                        setToId(newTo);
                                        e.target._map.closePopup();
                                        handleFind(fromId, newTo, viaPoints);
                                    };

                                    document.getElementById("addVia").onclick = () => {
                                        const updated = [...viaPoints, p.id];
                                        setViaPoints(updated);
                                        e.target._map.closePopup();

                                        handleFind(fromId, toId, updated);
                                    };

                                }, 50);

                            }
                        }}

                    />
                );
            })}

            {/* VIA STOP markers */}
            {viaPoints &&
                viaPoints.map(id => {
                    const p = PLACES.find(x => x.id === id);
                    if (!p) return null;
                    return (
                        <Marker
                            key={`via-${id}`}
                            position={[p.lat, p.lng]}
                            icon={ViaIcon}
                        />
                    );
                })}

            {/* Highlighted route */}
            {routeLatLngs.length > 1 && (
                <>
                    <Polyline positions={routeLatLngs} color="#2563eb" weight={6} />

                    {/* Direction arrows ON the route */}
                    <RouteDirectionArrows routeLatLngs={routeLatLngs} darkMode={darkMode} />

                </>
            )}

            {/* {showFloatingSteps && routeIds.length > 0 && (
        <FloatingStepMarkers routeIds={routeIds} routeSteps={routeSteps} />
      )} */}

            {/*  Route Animation  */}
            {showRouteAnimation && routeLatLngs.length > 1 && (
                <RouteAnimation routeLatLngs={routeLatLngs} routeSteps={routeSteps} />
            )}

            <FitBounds
                ids={routeIds.length > 1 ? routeIds : namedPlaces.map((p) => p.id)}
            />
        </MapContainer>
    );
}
