import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom icon for markers
const icon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    shadowSize: [41, 41]
});

// Color palette for different routes
const colors = ["blue", "green", "red", "purple", "orange"];

const MapDisplay = ({ routes }) => {
    const [scatsSites, setScatsSites] = useState([]);

    useEffect(() => {
        const fetchScatsSites = async () => {
            try {
                const response = await axios.get('http://localhost:5000/get_scats_sites');
                setScatsSites(response.data);
            } catch (error) {
                console.error("Error fetching SCATS sites:", error);
            }
        };
        fetchScatsSites();
    }, []);

    // Log routes to verify total_time is received
    useEffect(() => {
        console.log("Routes received:", routes);
    }, [routes]);

    return (
        <MapContainer center={[-37.8426, 145.0690]} zoom={13} style={{ height: "100%", width: "100%" }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
            />

            {/* Render SCATS Site Markers */}
            {scatsSites.map(site => (
                <Marker
                    key={site['SCATS Number']}
                    position={[site.Latitude, site.Longitude]}
                    icon={icon}
                >
                    <Popup>SCATS Number: {site['SCATS Number']}</Popup>
                </Marker>
            ))}

            {/* Render Routes as Polylines with distinct colors and display total travel time */}
            {routes.map((route, idx) => {
                console.log(`Route ${idx + 1} total_time:`, route.total_time);
                const routeCoords = route.coordinates;
                const color = colors[idx % colors.length];

                if (!routeCoords || routeCoords.length === 0) {
                    console.warn(`No valid coordinates found for route ${idx + 1}`);
                    return null;
                }

                // Ensure total_time is a number
                const totalTime = parseFloat(route.total_time);

                return (
                    <Polyline
                        key={idx}
                        positions={routeCoords}
                        color={color}
                    >
                        <Tooltip permanent>
                            <div>
                                <strong>Route {idx + 1}</strong><br />
                                Estimated Travel Time: {totalTime ? totalTime.toFixed(2) : 'N/A'} minutes
                            </div>
                        </Tooltip>
                    </Polyline>
                );
            })}
        </MapContainer>
    );
};

export default MapDisplay;
