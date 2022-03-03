import React, { useMemo } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Grid,
  LinearProgress,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Field } from 'formik';

import {
  darkModeSelector,
  itemViewSelector,
  setDarkMode,
  setItemView,
} from '../../reducers/settings';
import { closeSettingsDialog, openSnackbar, settingsDialogSelector } from '../../reducers/dialogs';
import { SelectField, CheckboxField } from '../fields';
import { useGetDatasetQuery } from '../../api';
import { capitalize } from '../../utils';
import ErrorAlert from '../ErrorAlert';

function SettingsDialog() {
  const darkMode = useSelector(darkModeSelector);
  const dialogOpen = useSelector(settingsDialogSelector);
  const itemView = useSelector(itemViewSelector);
  const dispatch = useDispatch();

  const dataset = useGetDatasetQuery();

  const handleClose = () => {
    dispatch(closeSettingsDialog());
  };

  const handleSubmit = (values) => {
    dispatch(setDarkMode(values.darkMode));
    dispatch(setItemView(values.itemView));
    dispatch(
      openSnackbar({
        message: 'All settings successfully applied!',
      })
    );
    handleClose();
  };

  const columnOptions = useMemo(() => {
    if (!dataset.data) {
      return [];
    }

    const options = Object.keys(dataset.data.attributes);

    return ['', ...options];
  }, [dataset.data]);

  return (
    <Dialog open={dialogOpen} fullWidth maxWidth="sm" onClose={handleClose}>
      <DialogTitle>Application Settings</DialogTitle>
      <Formik
        initialValues={{
          darkMode,
          itemView,
        }}
        validate={(values) => {
          const errors = {};
          const requiredMessage = 'This field is required.';
          if (!values.itemView.title) {
            errors['itemView.title'] = requiredMessage;
          }
          return errors;
        }}
        onSubmit={(values, { setSubmitting }) => {
          handleSubmit(values);
          setSubmitting(false);
        }}
      >
        {({ submitForm, isSubmitting }) => (
          <>
            <DialogContent>
              {dataset.isSuccess && (
                <Grid container direction="column" spacing={2}>
                  <Grid item>
                    <Typography variant="subtitle2" component="div">
                      Recommenders
                    </Typography>
                    {['title', 'subtitle', 'caption', 'image', 'content'].map((field) => (
                      <Field
                        key={field}
                        name={`itemView.${field}`}
                        label={`${capitalize(field)} attribute`}
                        fullWidth
                        component={SelectField}
                        options={columnOptions}
                      />
                    ))}
                  </Grid>
                  <Grid item>
                    <Typography variant="subtitle2" component="div">
                      Appearance
                    </Typography>
                    <Field name="darkMode" label="Nightshift Mode" component={CheckboxField} />
                  </Grid>
                </Grid>
              )}
              {dataset.isLoading && <LinearProgress />}
              {dataset.isError && <ErrorAlert error={dataset.error} />}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Close</Button>
              <Button
                onClick={submitForm}
                disabled={isSubmitting || dataset.isLoading || dataset.isError}
                autoFocus
              >
                Save
              </Button>
            </DialogActions>
          </>
        )}
      </Formik>
    </Dialog>
  );
}

export default SettingsDialog;
