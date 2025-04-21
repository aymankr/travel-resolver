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
  Stack,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CreateCityDrawer from "./components/CreateCityDrawer";
import CitiesApi from "../../api/cities.api";

const CitiesListPage = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [deleteCity, setDeleteCity] = useState(null);

  const fetchCities = async () => {
    try {
      setLoading(true);
      // Build query parameters
      const queryParams = new URLSearchParams({
        page: page + 1,
        per_page: rowsPerPage,
      });

      const response = await CitiesApi.paginate(queryParams);

      setCities(response.items);
      setTotalItems(response.pagination.total_items);
    } catch (err) {
      setError("Failed to fetch sentences");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, [page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async () => {
    try {
      await CitiesApi.delete(deleteCity.id);

      fetchCities();
    } catch (err) {
      setError("Failed to delete city");
    }
    setDeleteCity(null);
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
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h5" component="div">
          Cities
        </Typography>
        <Button variant="contained" onClick={() => setCreateDrawerOpen(true)}>
          Add City
        </Button>
      </Stack>

      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: "calc(100vh - 300px)" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell></TableCell>
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
                cities.map((city) => (
                  <TableRow key={city.id} hover sx={{ cursor: "pointer" }}>
                    <TableCell>{city.id}</TableCell>
                    <TableCell>{city.name}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => setDeleteCity(city)}>
                        <DeleteIcon />
                      </IconButton>
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

      <CreateCityDrawer
        open={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
        onRefresh={fetchCities}
      />

      <Dialog open={!!deleteCity} onClose={() => setDeleteCity(null)}>
        <DialogTitle>Delete City</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {deleteCity?.name}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteCity(null)}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CitiesListPage;
