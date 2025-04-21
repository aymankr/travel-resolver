import React from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@mui/material";

const formatTrainingTime = (minutes) => {
  if (minutes < 60) {
    return `${minutes.toFixed(2)} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes.toFixed(0)}min`;
};

const Ner = ({ model }) => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {model.name} - v{model.version}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {model.type} Model - Created on{" "}
        {new Date(model.created_at).toLocaleDateString()}
      </Typography>

      {model.description && (
        <Typography variant="body1" paragraph>
          {model.description}
        </Typography>
      )}

      <Grid container spacing={3}>
        {/* Key Metrics Cards */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Accuracy
              </Typography>
              <Typography variant="h4">
                {(model.accuracy * 100).toFixed(2)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Training Time
              </Typography>
              <Typography variant="h4">
                {formatTrainingTime(model.training_time / 60)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Training Data
              </Typography>
              <Typography variant="h4">
                {model.train_data_count.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Test Data
              </Typography>
              <Typography variant="h4">
                {model.test_data_count.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Training Parameters */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Training Parameters
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>Base Model</TableCell>
                      <TableCell>{model.base_model}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Iterations</TableCell>
                      <TableCell>{model.iterations}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Batch Size Range</TableCell>
                      <TableCell>
                        {model.batch_size_min} - {model.batch_size_max}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Grid>
              <Grid item xs={12} md={6}>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>Dropout Rate</TableCell>
                      <TableCell>{model.dropout_rate}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Learning Rate</TableCell>
                      <TableCell>{model.learning_rate}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Optimizer</TableCell>
                      <TableCell>{model.optimizer}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Entity Metrics */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Departure Entity Metrics
            </Typography>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>Precision</TableCell>
                  <TableCell>
                    {(model.departure_metrics.precision * 100).toFixed(2)}%
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Recall</TableCell>
                  <TableCell>
                    {(model.departure_metrics.recall * 100).toFixed(2)}%
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>F1 Score</TableCell>
                  <TableCell>
                    {(model.departure_metrics.f1 * 100).toFixed(2)}%
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Support</TableCell>
                  <TableCell>{model.departure_metrics.support}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Arrival Entity Metrics
            </Typography>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>Precision</TableCell>
                  <TableCell>
                    {(model.arrival_metrics.precision * 100).toFixed(2)}%
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Recall</TableCell>
                  <TableCell>
                    {(model.arrival_metrics.recall * 100).toFixed(2)}%
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>F1 Score</TableCell>
                  <TableCell>
                    {(model.arrival_metrics.f1 * 100).toFixed(2)}%
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Support</TableCell>
                  <TableCell>{model.arrival_metrics.support}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Ner;
