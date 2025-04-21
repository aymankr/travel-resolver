import React, { useState } from "react";
import {
  Drawer,
  IconButton,
  Button,
  Box,
  Typography,
  TextField,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CitiesApi from "../../../api/cities.api";

const CreateCityDrawer = ({ open, onClose, onRefresh }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await CitiesApi.create({ name });

      setName("");
      onClose();
      onRefresh();
    } catch (err) {
      setError("Failed to create city");
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: 400 },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h6">Add New City</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="City Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!error}
            helperText={error}
            required
            sx={{ mb: 3 }}
          />

          <Button type="submit" variant="contained" fullWidth>
            Add City
          </Button>
        </form>
      </Box>
    </Drawer>
  );
};

export default CreateCityDrawer;
