import React from "react";
import { BrowserRouter as Router, Outlet, Link } from "react-router-dom";
import { Box, AppBar, Toolbar, Typography, Button } from "@mui/material";
import MapIcon from "@mui/icons-material/Map";

function UserLayout() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "rgba(25, 118, 210, 0.6)",
          boxShadow: "none",
        }}
      >
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
              TrainQuest
            </Link>
          </Typography>
          <Button
            color="inherit"
            component={Link}
            to="/map"
            startIcon={<MapIcon />}
          >
            Train Map
          </Button>
        </Toolbar>
      </AppBar>

      <Outlet />
    </Box>
  );
}

export default UserLayout;
