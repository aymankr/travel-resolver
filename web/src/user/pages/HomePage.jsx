import React, { useState, useRef, useEffect } from "react";
import { Box, Container, Typography } from "@mui/material";
import SearchForm from "../components/SearchForm";
import TravelResults from "../components/TravelResults";
import LoadingIndicator from "../components/LoadingIndicator";
import ErrorAlert from "../components/ErrorAlert";
import BackgroundImage from "../../assets/travel-background.jpeg";
import NLUResults from "../components/NLUResults";
import NERResults from "../components/NERResults";
import TrainsMapperApi from "../api/trainsMapper.api";

const HomePage = () => {
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const resultsRef = useRef(null);

  const handleSearch = async (query, nlu, ner) => {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const response = await TrainsMapperApi.findTrips({
        text: query,
        ner,
        nlu,
      });

      setResults(response);
    } catch (err) {
      setError("Failed to fetch results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (results && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [results]);

  return (
    <>
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundImage: `url(${BackgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
          }}
        />
        <Container
          maxWidth="md"
          sx={{ position: "relative", textAlign: "center", mt: 8 }}
        >
          <Typography
            variant="h2"
            component="h1"
            sx={{ color: "white", mb: 4 }}
          >
            Find Your Perfect Train Journey
          </Typography>
          <SearchForm onSearch={handleSearch} />
        </Container>
      </Box>

      <Box
        ref={resultsRef}
        sx={{ bgcolor: "background.default", minHeight: "100vh" }}
      >
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <LoadingIndicator loading={loading} />
          <ErrorAlert error={error} />
          {results && (
            <>
              <NLUResults results={results} />
              <NERResults results={results} />
              {!results.trip_info?.error && (
                <TravelResults results={results.trip_info} />
              )}
            </>
          )}
        </Container>
      </Box>
    </>
  );
};

export default HomePage;
