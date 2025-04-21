import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, CircularProgress, Alert, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Ner from "./components/NER";
import Nlu from "./components/NLU";
import MlModelsApi from "../../api/mlModels.api";

const MLModelPage = () => {
  const { id } = useParams();
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchModel = async () => {
      try {
        setLoading(true);
        const response = await MlModelsApi.get(id);
        setModel(response);
      } catch (err) {
        setError("Failed to fetch model details");
      } finally {
        setLoading(false);
      }
    };

    fetchModel();
  }, [id]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!model) return <Alert severity="info">No model found</Alert>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center" }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/admin/models")}
          variant="outlined"
          sx={{ mr: 2 }}
        >
          Back to Models
        </Button>
      </Box>

      {model.type === "NER" && <Ner model={model} />}

      {model.type === "NLU" && <Nlu model={model} />}
    </Box>
  );
};

export default MLModelPage;
