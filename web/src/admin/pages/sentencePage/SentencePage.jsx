import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Button,
  Divider,
  Menu,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import SentencesApi from "../../api/sentences.api";

const entityTypes = ["DEPARTURE", "ARRIVAL"];

const SentencePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sentence, setSentence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [editedEntities, setEditedEntities] = useState([]);
  const [isTreated, setIsTreated] = useState(false);

  const fetchSentence = async () => {
    try {
      setLoading(true);
      const result = await SentencesApi.get(id);
      setSentence(result);
      setEditedEntities(result.entities || []);
      setIsTreated(result.isTreated);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSentence();
  }, [id]);

  const handleWordClick = (event, start, end) => {
    setAnchorEl(event.currentTarget);
    setSelectedPosition({ start, end });
  };

  const handleEntitySelect = (entityType) => {
    if (selectedPosition && entityType) {
      const newEntity = {
        start: selectedPosition.start,
        end: selectedPosition.end,
        label: entityType,
      };

      const filteredEntities = editedEntities.filter(
        (entity) =>
          !(
            entity.start === selectedPosition.start &&
            entity.end === selectedPosition.end
          )
      );

      setEditedEntities([...filteredEntities, newEntity]);
    } else if (selectedPosition) {
      setEditedEntities(
        editedEntities.filter(
          (entity) =>
            !(
              entity.start === selectedPosition.start &&
              entity.end === selectedPosition.end
            )
        )
      );
    }
    setAnchorEl(null);
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      await SentencesApi.update(
        id,
        JSON.stringify({
          entities: editedEntities,
          isTreated: isTreated,
        })
      );
      fetchSentence();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

  // Split sentence into words while preserving spaces and positions
  const words = [];
  const text = sentence.text;
  let lastIndex = 0;
  let match;
  const wordRegex = /\S+/g;

  while ((match = wordRegex.exec(text)) !== null) {
    // Add any whitespace before the word
    if (match.index > lastIndex) {
      words.push({
        text: text.slice(lastIndex, match.index),
        start: lastIndex,
        end: match.index,
        isSpace: true,
      });
    }
    // Add the word
    words.push({
      text: match[0],
      start: match.index,
      end: match.index + match[0].length,
      isSpace: false,
    });
    lastIndex = match.index + match[0].length;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: "flex", alignItems: "center" }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/admin/sentences")}
          variant="outlined"
          sx={{ mr: 2 }}
        >
          Back to Sentences
        </Button>
        <Typography variant="h5">Sentence #{id}</Typography>
      </Box>

      {/* Main content */}
      <Paper sx={{ p: 3 }} elevation={2}>
        <Stack spacing={3}>
          {/* Status Checkboxes */}
          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isTreated}
                  onChange={(e) => setIsTreated(e.target.checked)}
                />
              }
              label="Treated"
            />
          </Box>

          <Divider />

          {/* Text Content with Clickable Words */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Content
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                backgroundColor: "background.default",
                minHeight: "100px",
                lineHeight: "2.5",
              }}
            >
              <Box sx={{ display: "inline" }}>
                {words.map((word, index) => {
                  if (word.isSpace) {
                    return word.text;
                  }

                  const entityForWord = editedEntities.find(
                    (entity) =>
                      entity.start === word.start && entity.end === word.end
                  );

                  return (
                    <Button
                      key={`${word.start}-${word.end}`}
                      onClick={(e) => handleWordClick(e, word.start, word.end)}
                      variant={entityForWord ? "contained" : "outlined"}
                      color={
                        entityForWord?.label === "DEPARTURE"
                          ? "primary"
                          : entityForWord?.label === "ARRIVAL"
                          ? "secondary"
                          : "inherit"
                      }
                      size="small"
                      sx={{
                        textTransform: "none",
                        mx: 0.5,
                        minWidth: "auto",
                        padding: "0 8px",
                      }}
                    >
                      {word.text}
                    </Button>
                  );
                })}
              </Box>
            </Paper>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            {entityTypes.map((type) => (
              <MenuItem key={type} onClick={() => handleEntitySelect(type)}>
                {type}
              </MenuItem>
            ))}
            <MenuItem onClick={() => handleEntitySelect(null)}>
              Remove Annotation
            </MenuItem>
          </Menu>

          <Divider />

          {/* Entities Section */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Entities
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Current Entities
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {editedEntities.length > 0 ? (
                    editedEntities.map((entity, index) => (
                      <Chip
                        key={index}
                        label={`${sentence.text.slice(
                          entity.start,
                          entity.end
                        )} (${entity.label}) [${entity.start}-${entity.end}]`}
                        onDelete={() => handleEntitySelect(null)}
                        color={
                          entity.label === "DEPARTURE" ? "primary" : "secondary"
                        }
                        sx={{ mb: 1 }}
                      />
                    ))
                  ) : (
                    <Typography color="text.secondary">No entities</Typography>
                  )}
                </Stack>
              </Box>
            </Stack>
          </Box>

          <Divider />

          {/* Save Button */}
          <Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleUpdate}
              fullWidth
            >
              Save Changes
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default SentencePage;
