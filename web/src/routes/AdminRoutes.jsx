import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import DashboardPage from "../admin/pages/dashboardPage/DashboardPage";
import SentencesListPage from "../admin/pages/sentencesListPage/SentencesListPage";
import SentencePage from "../admin/pages/sentencePage/SentencePage";
import CitiesListPage from "../admin/pages/citiesListPage/CitiesListPage";
import MLModelsListPage from "../admin/pages/mlModelsListPage/MLModelsListPage";
import MLModelPage from "../admin/pages/mlModelPage/MlModelPage";
import AdminLayout from "../admin/AdminLayout";
import LoginPage from "../admin/pages/loginPage/LoginPage";

const navigationItems = [
  {
    path: "",
    component: <DashboardPage />,
  },
  {
    path: "sentences",
    component: <SentencesListPage />,
  },
  {
    path: "sentences/:id",
    component: <SentencePage />,
  },
  {
    path: "cities",
    component: <CitiesListPage />,
  },
  {
    path: "models",
    component: <MLModelsListPage />,
  },
  {
    path: "models/:id",
    component: <MLModelPage />,
  },
];

const AdminRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route element={<LoginPage />} path="admin/login" />

        <Route element={<AdminLayout />}>
          {navigationItems.map((item) => (
            <Route
              key={item.path}
              path={`admin/${item.path}`}
              element={item.component}
            />
          ))}
        </Route>
      </Routes>
    </Router>
  );
};

export default AdminRoutes;
