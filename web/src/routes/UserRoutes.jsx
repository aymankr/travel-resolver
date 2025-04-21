import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import HomePage from "../user/pages/HomePage";
import TrainMapPage from "../user/pages/TrainMapPage";
import UserLayout from "../user/UserLayout";

function UserRoutes() {
  return (
    <Router>
      <Routes>
        <Route element={<UserLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/map" element={<TrainMapPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default UserRoutes;
