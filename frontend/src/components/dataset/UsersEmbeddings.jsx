import React, { useState } from 'react';
import pt from 'prop-types';
import { Box, Grid, Paper } from '@mui/material';

import ErrorAlert from '../ErrorAlert';
import EmbeddingsPlot from './EmbeddingsPlot';
import { useGetUsersEmbeddingsQuery, useSearchItemsMutation } from '../../api';
import { PlotLoader } from '../loaders';
import AttributesSelector from './AttributesSelector';
import UsersDescription from './UsersDescription';

function UsersEmbeddings({ attributes, split }) {
  const [filterResetIndex, setFilterResetIndex] = useState(0);
  const [plotResetIndex, setPlotResetIndex] = useState(0);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const embeddings = useGetUsersEmbeddingsQuery();
  const [searchUsers, users] = useSearchItemsMutation();

  if (embeddings.isError) {
    return <ErrorAlert error={embeddings.error} />;
  }

  if (users.isError) {
    return <ErrorAlert error={users.error} />;
  }

  const handleFilterApply = (query) => {
    searchUsers({
      split,
      query,
    });
  };

  const handlePlotUnselect = () => {
    setFilterResetIndex(filterResetIndex + 1);
    setSelectedUsers([]);
  };

  const handlePlotSelect = (ids) => {
    setFilterResetIndex(filterResetIndex + 1);
    setSelectedUsers(ids);
  };

  const handleFilterChange = () => {
    setPlotResetIndex(plotResetIndex + 1);
    setSelectedUsers([]);
  };

  const isLoading = embeddings.isLoading || users.isLoading;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <AttributesSelector
          onChange={handleFilterChange}
          resetIndex={filterResetIndex}
          disabled={isLoading}
          attributes={attributes}
          onFilterApply={handleFilterApply}
          displayThreshold
        />
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2} sx={{ height: 500 }}>
          <Grid item xs={8}>
            <Box position="relative">
              {isLoading && <PlotLoader />}
              <Paper sx={{ p: 2 }}>
                <EmbeddingsPlot
                  resetIndex={plotResetIndex}
                  onUnselect={handlePlotUnselect}
                  embeddings={embeddings.data}
                  onSelect={handlePlotSelect}
                  filterResults={users.data}
                />
              </Paper>
            </Box>
          </Grid>
          <Grid item xs={4} sx={{ height: '100%' }}>
            {selectedUsers.length > 0 && (
              <Paper sx={{ p: 3, height: '100%', overflow: 'auto' }}>
                <UsersDescription users={selectedUsers} />
              </Paper>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

UsersEmbeddings.defaultProps = {
  split: 'train',
};

UsersEmbeddings.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  attributes: pt.any.isRequired,
  split: pt.string,
};

export default UsersEmbeddings;
