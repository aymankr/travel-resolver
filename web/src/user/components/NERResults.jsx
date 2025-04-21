import React from "react";
import { Box, Typography, Paper, Chip, Alert } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

const NERResults = ({ results }) => {
  if (!results) return null;

  const { trip_info, error, departure, arrival } = results;

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        NER Results
      </Typography>

      {!trip_info && !error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          No informations
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {trip_info && trip_info.error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {trip_info.error}
        </Alert>
      )}

      {departure && (
        <>
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            Departure Entity:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            <Chip
              key="departure"
              label={departure}
              color="primary"
              variant="outlined"
            />
          </Box>
        </>
      )}

      {arrival && (
        <>
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            Arrival Entity:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            <Chip
              key="arrival"
              label={arrival}
              color="secondary"
              variant="outlined"
            />
          </Box>
        </>
      )}

      {trip_info && trip_info.start_stations && trip_info.end_stations && (
        <>
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            Detected Stations:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {trip_info.start_stations.map((station, index) => (
              <Chip
                key={`start-${index}`}
                label={`From: ${station}`}
                color="primary"
                variant="outlined"
              />
            ))}
            {trip_info.end_stations.map((station, index) => (
              <Chip
                key={`end-${index}`}
                label={`To: ${station}`}
                color="secondary"
                variant="outlined"
              />
            ))}
          </Box>
        </>
      )}
    </Paper>
  );
};

export default NERResults;
