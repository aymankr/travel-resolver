import React from "react";
import { Box, Typography, Paper, Chip } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

const NLUResults = ({ results }) => {
  if (!results) return null;

  const { confidence, is_travel_related } = results;

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        NLU Results
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Typography variant="body1" sx={{ mr: 2 }}>
          Travel Related:
        </Typography>
        {is_travel_related ? (
          <Chip
            icon={<CheckCircleIcon />}
            label="Yes"
            color="success"
            variant="outlined"
          />
        ) : (
          <Chip
            icon={<CancelIcon />}
            label="No"
            color="error"
            variant="outlined"
          />
        )}
      </Box>
      <Typography variant="body1" gutterBottom>
        Confidence: {(confidence * 100).toFixed(2)}%
      </Typography>
    </Paper>
  );
};

export default NLUResults;
