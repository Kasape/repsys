import React, { useState } from 'react';
import { Container, Grid, Typography, Box } from '@mui/material';

import EmbeddingsPlot from './EmbeddingsPlot';
import ItemDescriptionPanel from './ItemDescriptionPanel';

const columns = {
  year: {
    dtype: 'number',
    bins: [
      [0, 1983],
      [1984, 2000],
      [2001, 2005],
      [2006, 2020],
    ],
  },
  genres: {
    dtype: 'tags',
    options: ['action', 'drama', 'comedy', 'horror'],
  },
  country: {
    dtype: 'category',
    options: ['CO', 'MK', 'CN', 'FR', 'ID'],
  },
};

function DatasetEvaluation() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  return (
    <Container maxWidth="xl">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box pl={1}>
            <Typography component="div" variant="h6">
              Item Embeddings
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              A space of item embeddings and their attributes to explore the primary space
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item md={8} xs={12}>
              <EmbeddingsPlot columns={columns} onSelect={(ids) => setSelectedItems(ids)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <ItemDescriptionPanel columns={columns} selectedItems={selectedItems} />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Box pl={1}>
            <Typography component="div" variant="h6">
              User Embeddings
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              A space of user embeddings to explore the primary space
            </Typography>
          </Box>
          {/* <Grid container spacing={2}>
            <Grid item md={8} xs={12}>
              <EmbeddingsPlot columns={columns} onSelect={(ids) => setSelectedUsers(ids)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <ItemDescriptionPanel columns={columns} selectedItems={selectedUsers} />
            </Grid>
          </Grid> */}
        </Grid>
      </Grid>
    </Container>
  );
}

export default DatasetEvaluation;
