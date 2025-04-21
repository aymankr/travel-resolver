import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  TextField,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import MlModelsApi from "../../api/mlModels.api";

const MLModelsListPage = () => {
  const navigate = useNavigate();
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState({
    type: "",
    name: "",
  });

  const fetchModels = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page + 1,
        per_page: rowsPerPage,
        ...(filters.type && { type: filters.type }),
        ...(filters.name && { name: filters.name }),
      });

      const response = await MlModelsApi.paginate(queryParams);

      setModels(response.items);
      setTotalItems(response.pagination.total_items);
    } catch (err) {
      setError("Failed to fetch models");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, [page, rowsPerPage, filters]);

  const handleRowClick = (modelId) => {
    navigate(`/admin/models/${modelId}`);
  };

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        ML Models
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Search by name"
            value={filters.name}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, name: e.target.value }))
            }
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            label="Model Type"
            value={filters.type}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, type: e.target.value }))
            }
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="NER">NER</MenuItem>
            <MenuItem value="NLU">NLU</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Accuracy</TableCell>
                <TableCell>Training Data</TableCell>
                <TableCell>Created At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (
                models.map((model) => (
                  <TableRow
                    key={model.id}
                    hover
                    onClick={() => handleRowClick(model.id)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell>{model.name}</TableCell>
                    <TableCell>{model.type}</TableCell>
                    <TableCell>{(model.accuracy * 100).toFixed(2)}%</TableCell>
                    <TableCell>
                      {model.train_data_count.toLocaleString()} sentences
                    </TableCell>
                    <TableCell>
                      {new Date(model.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={totalItems}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>
    </Box>
  );
};

export default MLModelsListPage;
