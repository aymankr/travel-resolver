import React, { useState, useEffect } from "react";
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
  CircularProgress,
  Alert,
  Chip,
  FormGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SentencesApi from "../../api/sentences.api";

// Constants for localStorage
const STORAGE_KEY = "sentenceFilters";
const DEFAULT_FILTERS = {
  isTreated: "all",
  isValid: "all",
};

const SentencesListPage = () => {
  const navigate = useNavigate();
  const [sentences, setSentences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Initialize filters from localStorage or use defaults
  const [filters, setFilters] = useState(() => {
    try {
      const savedFilters = localStorage.getItem(STORAGE_KEY);
      return savedFilters ? JSON.parse(savedFilters) : DEFAULT_FILTERS;
    } catch (error) {
      console.error("Error loading filters from localStorage:", error);
      return DEFAULT_FILTERS;
    }
  });

  const fetchSentences = async () => {
    try {
      setLoading(true);
      // Build query parameters
      const queryParams = new URLSearchParams({
        page: page + 1, // API uses 1-based pagination
        per_page: rowsPerPage,
        ...(filters.isTreated !== "all" && { isTreated: filters.isTreated }),
        ...(filters.isValid !== "all" && { isValid: filters.isValid }),
      });

      const response = await SentencesApi.paginate(queryParams);

      setSentences(response.items);
      setTotalItems(response.pagination.total_items);
    } catch (err) {
      setError("Failed to fetch sentences");
    } finally {
      setLoading(false);
    }
  };

  // Save filters to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.error("Error saving filters to localStorage:", error);
    }
  }, [filters]);

  useEffect(() => {
    fetchSentences();
  }, [page, rowsPerPage, filters]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (filterName) => (event) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: event.target.value,
    }));
    setPage(0);
  };

  // Reset filters to default
  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(0);
  };

  const handleRowClick = (sentenceId) => {
    navigate(`/admin/sentences/${sentenceId}`);
  };

  if (error) {
    return (
      <Box m={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom component="div">
        Sentences
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="subtitle1">Filters</Typography>
          <Typography
            variant="body2"
            color="primary"
            sx={{
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" },
            }}
            onClick={handleResetFilters}
          >
            Reset Filters
          </Typography>
        </Box>
        <FormGroup row sx={{ gap: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Treatment Status</InputLabel>
            <Select
              value={filters.isTreated}
              label="Treatment Status"
              onChange={handleFilterChange("isTreated")}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="true">Treated</MenuItem>
              <MenuItem value="false">Untreated</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Validation Status</InputLabel>
            <Select
              value={filters.isValid}
              label="Validation Status"
              onChange={handleFilterChange("isValid")}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="true">Valid</MenuItem>
              <MenuItem value="false">Invalid</MenuItem>
            </Select>
          </FormControl>
        </FormGroup>
      </Paper>

      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: "calc(100vh - 300px)" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Text</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Treatment</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (
                sentences.map((sentence) => (
                  <TableRow
                    key={sentence.id}
                    hover
                    onClick={() => handleRowClick(sentence.id)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell>{sentence.id}</TableCell>
                    <TableCell>{sentence.text}</TableCell>
                    <TableCell>
                      {sentence.isValid ? (
                        <Chip label="Valid" color="success" size="small" />
                      ) : (
                        <Chip label="Invalid" color="error" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      {sentence.isTreated ? (
                        <Chip label="Treated" color="primary" size="small" />
                      ) : (
                        <Chip label="Untreated" color="warning" size="small" />
                      )}
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
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default SentencesListPage;
