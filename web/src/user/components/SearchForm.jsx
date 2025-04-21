import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import MlModelsApi from "../api/mlModels.api";
import WhisperApi from "../api/whisper.api";

const SearchForm = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  const [loadingModels, setLoadingModels] = useState(false);
  const [mlModels, setMlModels] = useState(null);
  const [error, setError] = useState(null);
  const [selectedNer, setSelectedNer] = useState("");
  const [selectedNlu, setSelectedNlu] = useState("");

  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [transcribing, setTranscribing] = useState(false);
  const [whisperReady, setWhisperReady] = useState(false);

  let tempChunks = [];

  const fetchModels = async () => {
    try {
      setLoadingModels(true);
      const response = await MlModelsApi.getAll();
      setMlModels(response);

      const nerModels = response.filter((model) => model.type === "NER");
      const nluModels = response.filter((model) => model.type === "NLU");

      if (nerModels.length > 0) setSelectedNer(nerModels[0].name);
      if (nluModels.length > 0) setSelectedNlu(nluModels[0].name);
    } catch (err) {
      console.error("Failed to fetch models:", err);
      setError("Failed to fetch models");
    } finally {
      setLoadingModels(false);
    }
  };

  const checkWhisperService = async () => {
    const available = await WhisperApi.isServiceAvailable();
    setWhisperReady(available);
  };

  useEffect(() => {
    fetchModels();
    checkWhisperService();

    const interval = setInterval(() => {
      if (!whisperReady) {
        checkWhisperService();
      } else {
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [whisperReady]);

  const nerModels = mlModels?.filter((model) => model.type === "NER") || [];
  const nluModels = mlModels?.filter((model) => model.type === "NLU") || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query, selectedNlu, selectedNer);
  };

  const sendAudioToWhisper = async (audioBlob) => {
    setTranscribing(true);
    setError(null);

    if (audioBlob.size === 0) {
      setError("No audio captured. Please try again.");
      setTranscribing(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", audioBlob, "recording.webm");

    try {
      const response = await WhisperApi.transcribe(formData);
      if (response && response.transcript) {
        setQuery(response.transcript);
      } else if (response && response.error) {
        setError(response.error);
      } else {
        setError("No transcript received. Please try again.");
      }
    } catch (err) {
      console.error("Error during transcription:", err);
      setError("Error during transcription. Please try again.");
    } finally {
      setTranscribing(false);
    }
  };

  const handleAudioClick = async () => {
    if (!whisperReady) {
      setError("Whisper service is not ready yet. Please wait.");
      return;
    }

    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        let mimeType = "audio/webm;codecs=opus";
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          console.warn("audio/webm;codecs=opus not supported, fallback to audio/webm");
          mimeType = "audio/webm";
        }

        if (mediaRecorder) {
          mediaRecorder.stream.getTracks().forEach((track) => track.stop());
          setMediaRecorder(null);
        }

        const recorder = new MediaRecorder(stream, { mimeType });

        tempChunks = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            tempChunks.push(e.data);
          }
        };

        recorder.onstop = async () => {
          const blob = new Blob(tempChunks, { type: mimeType });
          if (blob.size > 0) {
            console.log("Sending recorded audio for transcription...");
            await sendAudioToWhisper(blob);
          } else {
            console.warn("No audio captured during recording.");
            setError("No audio captured. Please try again.");
          }
          // tempChunks est local, réinitialisé au prochain start
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
      } catch (err) {
        console.error("Error accessing microphone:", err);
        setError("Could not access microphone");
      }
    } else {
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop(); // Arrête l'enregistrement => onstop => transcription immédiate
      }
      setIsRecording(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          maxWidth: 800,
          mx: "auto",
        }}
      >
        {error && <Alert severity="error">{error}</Alert>}
        {loadingModels && <CircularProgress />}

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="e.g., 'Je veux aller de Paris à Lyon'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "rgba(255, 255, 255, 0.9)",
              },
            }}
          />
          <IconButton
            onClick={handleAudioClick}
            color="primary"
            sx={{ backgroundColor: "rgba(255,255,255,0.9)" }}
            disabled={transcribing || !whisperReady}
          >
            {isRecording ? <StopIcon /> : <MicIcon />}
          </IconButton>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            startIcon={<SearchIcon />}
            sx={{ px: 4 }}
            disabled={transcribing}
          >
            {transcribing ? "Processing..." : "Search"}
          </Button>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <FormControl fullWidth size="small">
            <Select
              value={selectedNer}
              onChange={(e) => setSelectedNer(e.target.value)}
              label="NER Model"
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
              }}
            >
              {mlModels?.filter((model) => model.type === "NER").map((model) => (
                <MenuItem key={model.name} value={model.name}>
                  {model.name} ({model.accuracy.toFixed(2)})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <Select
              value={selectedNlu}
              onChange={(e) => setSelectedNlu(e.target.value)}
              label="NLU Model"
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
              }}
            >
              {mlModels?.filter((model) => model.type === "NLU").map((model) => (
                <MenuItem key={model.name} value={model.name}>
                  {model.name} ({model.accuracy.toFixed(2)})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>
    </form>
  );
};

export default SearchForm;
