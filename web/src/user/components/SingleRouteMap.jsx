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

const SingleRouteMap = ({ route }) => {
  if (!route) return null;

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

  // Calculate center and bounds
  const positions = route.segments.flatMap((segment) =>
    segment.stops.map((stop) => [stop.lat, stop.lon])
  );
  
  const bounds = positions.reduce(
    (acc, pos) => {
      return {
        minLat: Math.min(acc.minLat, pos[0]),
        maxLat: Math.max(acc.maxLat, pos[0]),
        minLon: Math.min(acc.minLon, pos[1]),
        maxLon: Math.max(acc.maxLon, pos[1]),
      };
    },
    {
      minLat: 90,
      maxLat: -90,
      minLon: 180,
      maxLon: -180,
    }
  );

  const center = [
    (bounds.minLat + bounds.maxLat) / 2,
    (bounds.minLon + bounds.maxLon) / 2,
  ];

  return (
    <MapContainer
      center={center}
      zoom={6}
      style={{ height: "300px", width: "100%", marginBottom: "1rem" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Polyline
        positions={positions}
        color="blue"
        weight={3}
        opacity={0.8}
      >
        <Popup>
          {route.from} to {route.to}
          <br />
          Duration: {route.total_duration_formatted}
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
              key={`${segmentIndex}-${stopIndex}`}
              position={[stop.lat, stop.lon]}
              icon={createIcon(iconColor)}
            >
              <Popup>
                {iconColor === "green"
                  ? "Start: "
                  : iconColor === "red"
                  ? "End: "
                  : "Stop: "}
                {stop.name}
                {stop.arrival && (
                  <>
                    <br />
                    Arrival: {stop.arrival}
                  </>
                )}
                {stop.departure && (
                  <>
                    <br />
                    Departure: {stop.departure}
                  </>
                )}
              </Popup>
            </Marker>
          );
        })
      )}
    </MapContainer>
  );
};

export default SingleRouteMap;
