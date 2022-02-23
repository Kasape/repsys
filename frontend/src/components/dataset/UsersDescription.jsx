import React, { useEffect } from 'react';
import pt from 'prop-types';
import { Typography, Stack, Box, List } from '@mui/material';

import BarPlotHistogram from './BarPlotHistogram';
import { PanelLoader } from '../loaders';
import { ItemListView } from '../items';
import ErrorAlert from '../ErrorAlert';
import { useDescribeUsersMutation } from '../../api';

function UsersDescription({ users, split }) {
  const [describeUsers, { data, error, isError, isLoading, isUninitialized }] =
    useDescribeUsersMutation();

  useEffect(() => {
    if (users.length) {
      describeUsers({ users, split });
    }
  }, [users]);

  if (isUninitialized) {
    return null;
  }

  if (isError) {
    return <ErrorAlert error={error} />;
  }

  if (isLoading) {
    return <PanelLoader />;
  }

  const { distribution, topItems } = data.interactions;

  return (
    <Stack spacing={1}>
      <Box>
        <Typography variant="h6" sx={{ fontSize: '1rem' }}>
          Interacted Items
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
          A list of the most interacted items
        </Typography>
        <List dense>
          {topItems.map((item) => (
            <ItemListView key={item.id} item={item} style={{ paddingLeft: 5 }} />
          ))}
        </List>
      </Box>
      <Box>
        <Typography variant="h6" sx={{ fontSize: '1rem' }}>
          Interactions Distribution
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
          A distribution of the interaction values
        </Typography>
        <BarPlotHistogram bins={distribution.bins} values={distribution.values} />
      </Box>
    </Stack>
  );
}

UsersDescription.defaultProps = {
  split: 'train',
};

UsersDescription.propTypes = {
  split: pt.string,
  users: pt.arrayOf(pt.number).isRequired,
};

export default UsersDescription;
