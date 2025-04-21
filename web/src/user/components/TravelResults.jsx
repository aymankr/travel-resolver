import React from "react";
import {
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Paper,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TrainIcon from "@mui/icons-material/Train";
import RouteInfo from "./RouteInfo";
import SingleRouteMap from "./SingleRouteMap";

const TravelResults = ({ results }) => {
  if (!results) return null;

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography
        variant="h5"
        gutterBottom
        color="primary"
        sx={{ mb: 2 }}
      >
        Routes from {results.start_stations[0]}
      </Typography>
      {results.routes
        .sort(function (a, b) {
          return a.total_duration - b.total_duration;
        })
        .map((route, index) => (
          <Accordion
            key={index}
            sx={{ mb: 2, borderRadius: 2, "&:before": { display: "none" } }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${index}a-content`}
              id={`panel${index}a-header`}
              sx={{ backgroundColor: "rgba(25, 118, 210, 0.08)" }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", width: "100%" }}
              >
                <TrainIcon sx={{ mr: 2, color: "primary.main" }} />
                <Typography sx={{ flexGrow: 1 }}>
                  Route {index + 1}: {route.from} to {route.to}
                </Typography>
                <Chip
                  label={route.total_duration_formatted}
                  color="primary"
                  size="small"
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <SingleRouteMap route={route} />
              <RouteInfo route={route} index={index} />
            </AccordionDetails>
          </Accordion>
        ))}
    </Paper>
  );
};

export default TravelResults;
