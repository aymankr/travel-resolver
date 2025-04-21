import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useTheme } from "@mui/material/styles";
import SentencesApi from "../../api/sentences.api";

const DashboardPage = () => {
  const theme = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const result = await SentencesApi.getStats();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box m={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const validationData = [
    { name: "Valid", value: data.valid_sentences },
    { name: "Invalid", value: data.total_sentences - data.valid_sentences },
  ];

  const treatmentData = [
    { name: "Treated", value: data.treated_sentences },
    { name: "Untreated", value: data.total_sentences - data.treated_sentences },
  ];

  const COLORS = {
    valid: theme.palette.success.main,
    invalid: theme.palette.error.main,
    treated: theme.palette.primary.main,
    untreated: theme.palette.warning.main,
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom color="textSecondary">
              Total Sentences
            </Typography>
            <Typography
              variant="h3"
              component="div"
              color="primary"
              sx={{ mt: 2 }}
            >
              {data.total_sentences}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom color="textSecondary">
              Valid Sentences
            </Typography>
            <Typography
              variant="h3"
              component="div"
              color="success.main"
              sx={{ mt: 2 }}
            >
              {data.valid_sentences}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {data.validation_rate}% of total
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom color="textSecondary">
              Treated Sentences
            </Typography>
            <Typography
              variant="h3"
              component="div"
              color="warning.main"
              sx={{ mt: 2 }}
            >
              {data.treated_sentences}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {data.completion_rate}% of total
            </Typography>
          </Paper>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom color="textSecondary">
              Validation Status
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={validationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    <Cell fill={COLORS.valid} />
                    <Cell fill={COLORS.invalid} />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom color="textSecondary">
              Treatment Status
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={treatmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    <Cell fill={COLORS.treated} />
                    <Cell fill={COLORS.untreated} />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
