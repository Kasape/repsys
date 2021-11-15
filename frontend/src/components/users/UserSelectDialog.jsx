import React, { useState } from 'react';
import pt from 'prop-types';
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Autocomplete,
  TextField,
  CircularProgress,
  Drawer,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { useSelector, useDispatch } from 'react-redux';

import { getRequest } from '../../api';
import {
  customInteractionsSelector,
  favouriteUsersSelector,
  setCustomInteractions,
  setSelectedUser,
} from '../../reducers/root';
import { closeUserSelectDialog, userSelectDialogSelector } from '../../reducers/dialogs';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: pt.arrayOf(pt.element).isRequired,
  value: pt.number.isRequired,
  index: pt.number.isRequired,
};

function UserSelectDialog() {
  const dispatch = useDispatch();
  const customInteractions = useSelector(customInteractionsSelector);
  const dialogOpen = useSelector(userSelectDialogSelector);
  const [user, setUser] = useState(null);
  const [interactions, setInteractions] = useState(customInteractions);
  const [activeTab, setActiveTab] = useState(0);
  const [inputValue, setInputValue] = useState('');

  const favouriteUsers = useSelector(favouriteUsersSelector);

  const { items: itemsData, isLoading } = getRequest('/items', {
    query: inputValue,
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleDialogClose = () => {
    dispatch(closeUserSelectDialog());
  };

  const handleUserSelect = () => {
    dispatch(setSelectedUser(user));
    dispatch(setCustomInteractions([]));
    handleDialogClose();
  };

  const handleInteractionsSelect = () => {
    dispatch(setCustomInteractions(interactions));
    dispatch(setSelectedUser(null));
    handleDialogClose();
  };

  return (
    <Drawer anchor="right" open={dialogOpen} onClose={handleDialogClose}>
      <Box
        sx={{
          minWidth: 450,
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} centered>
            <Tab label="Simulator" />
            <Tab label="Favourites" />
          </Tabs>
        </Box>
        <TabPanel value={activeTab} index={0}>
          <Typography variant="h6" component="div">
            Test User Simulator
          </Typography>
          <Typography variant="body2" component="div">
            Create a test user based on his interactions.
          </Typography>
          <Autocomplete
            multiple
            value={interactions}
            onChange={(event, newValue) => {
              setInteractions(newValue);
            }}
            filterOptions={(x) => x}
            loading={isLoading}
            openOnFocus
            isOptionEqualToValue={(option, value) => option.id === value.id}
            options={itemsData}
            getOptionLabel={(item) => item.title}
            sx={{ width: 400, marginBottom: 2, marginTop: 2 }}
            onInputChange={(event, newInputValue) => {
              setInputValue(newInputValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="filled"
                label="User interactions"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
          <Button
            disabled={interactions.length === 0}
            color="secondary"
            startIcon={<CheckIcon />}
            variant="contained"
            onClick={handleInteractionsSelect}
          >
            Select Interactions
          </Button>
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <Typography variant="h6" component="div">
            Favourite Users
          </Typography>
          <Typography variant="body2" component="div">
            Select a user from the list of favourites.
          </Typography>
          <Autocomplete
            disablePortal
            value={user}
            onChange={(event, newValue) => {
              setUser(newValue);
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            options={favouriteUsers}
            getOptionLabel={(u) => `User ${u.label}`}
            sx={{ width: '100%', marginBottom: 2, marginTop: 2 }}
            renderInput={(params) => (
              <TextField {...params} variant="filled" label="Selected user" />
            )}
          />
          <Button
            disabled={!user}
            color="secondary"
            startIcon={<CheckIcon />}
            variant="contained"
            onClick={handleUserSelect}
          >
            Select user
          </Button>
        </TabPanel>
      </Box>
    </Drawer>
  );
}

export default UserSelectDialog;
