import React from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
} from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";

const MapDisplay = ({ tripData }) => {
  if (!tripData || !tripData.routes || tripData.routes.length === 0) {
    return null;
  }

  const centerLat = 46.603354;
  const centerLon = 1.888334;
  const colors = [
    "red",
    "blue",
    "green",
    "purple",
    "orange",
    "darkred",
    "lightred",
    "beige",
    "darkblue",
    "darkgreen",
  ];

  const createIcon = (color) =>
    new Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

  return (
    <MapContainer
      center={[centerLat, centerLon]}
      zoom={6}
      style={{ height: "70vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {tripData.routes.map((route, routeIndex) => {
        const color = colors[routeIndex % colors.length];
        const positions = route.segments.flatMap((segment) =>
          segment.stops.map((stop) => [stop.lat, stop.lon])
        );

        return (
          <React.Fragment key={routeIndex}>
            <Polyline
              positions={positions}
              color={color}
              weight={3}
              opacity={0.8}
            >
              <Popup>
                {route.from} to {route.to}
                <br />
                Duration: {route.total_duration}
              </Popup>
            </Polyline>
            {route.segments.flatMap((segment, segmentIndex) =>
              segment.stops.map((stop, stopIndex) => {
                let iconColor = "blue";
                if (segmentIndex === 0 && stopIndex === 0) {
                  iconColor = "green";
                } else if (
                  segmentIndex === route.segments.length - 1 &&
                  stopIndex === segment.stops.length - 1
                ) {
                  iconColor = "red";
                }
                return (
                  <Marker
                    key={`${routeIndex}-${segmentIndex}-${stopIndex}`}
                    position={[stop.lat, stop.lon]}
                    icon={createIcon(iconColor)}
                  >
                    <Popup>
                      {iconColor === "green"
                        ? "Start: "
                        : iconColor === "red"
                        ? "End: "
                        : ""}
                      {stop.name} (ID: {stop.id})
                    </Popup>
                  </Marker>
                );
              })
            )}
          </React.Fragment>
        );
      })}
    </MapContainer>
  );
};

export default MapDisplay;
