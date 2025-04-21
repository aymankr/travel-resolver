import React from "react";
import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TrainIcon from "@mui/icons-material/Train";

const RouteSegment = ({ segment, index }) => (
  <Box sx={{ mb: 3, pl: 2, borderLeft: "2px solid #1976d2" }}>
    <Typography variant="subtitle1" fontWeight="bold" color="primary">
      Segment {index + 1}
    </Typography>
    {/* <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
      <AccessTimeIcon sx={{ mr: 1, color: "text.secondary" }} />
      <Typography variant="body2">
        Departure: {segment.departure} | Arrival: {segment.arrival}
      </Typography>
    </Box> */}
    <Chip
      icon={<AccessTimeIcon />}
      label={`Duration: ${segment.duration}`}
      color="primary"
      variant="outlined"
      size="small"
      sx={{ mb: 1 }}
    />
    <Typography variant="body2" sx={{ mb: 1 }}>
      Trip ID: {segment.trip_id}
    </Typography>
    <Typography variant="subtitle2" sx={{ mt: 1, mb: 0.5 }}>
      Stops:
    </Typography>
    <List dense disablePadding>
      {segment.stops.map((stop) => (
        <ListItem key={stop.id} disableGutters>
          <TrainIcon
            sx={{ mr: 1, color: "text.secondary", fontSize: "small" }}
          />
          <ListItemText primary={stop.name} />
        </ListItem>
      ))}
    </List>
  </Box>
);

export default RouteSegment;
