import React from "react";
import { Typography, Box, Divider } from "@mui/material";
import RouteSegment from "./RouteSegment";

const RouteInfo = ({ route }) => (
  <Box>
    <Typography variant="subtitle1" color="secondary" sx={{ mb: 2 }}>
      Total Duration: {route.total_duration_formatted}
    </Typography>
    <Divider sx={{ mb: 2 }} />
    {route.segments.map((segment, i) => (
      <RouteSegment key={i} segment={segment} index={i} />
    ))}
  </Box>
);

export default RouteInfo;
