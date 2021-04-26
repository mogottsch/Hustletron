import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Grid,
  makeStyles,
  Snackbar,
} from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import Alert, { Color } from '@material-ui/lab/Alert';
import { ipcRenderer } from 'electron';
import React, { useState } from 'react';
import Info from './Info';
import Recorder from './Recorder';
import Trigger from './Trigger';

const useStyles = makeStyles(() => ({
  btnBox: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    zIndex: 1,
  },
}));

type Message = {
  text: string;
  severity: Color;
};

const FormContainer = () => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [macroKeys, setMacroKeys] = useState<Key[]>([]);
  const [triggerKeys, setKeys] = useState<Key[]>([]);

  const submit = () => {
    setLoading(true);
    ipcRenderer
      .invoke('generate-ahk-file', {
        triggerKeys,
        macroKeys,
      })
      .then((response) => {
        if (!response.success) {
          throw response.error;
        }
        setMessage({
          text:
            'Succesfully generated genemater.ahk. Take a look at your Desktop! ',
          severity: 'success',
        });
        return true;
      })
      .finally(() => setLoading(false))
      .catch((error: unknown) =>
        setMessage({
          text: `Error generating ahk file :( \n ${error}`,
          severity: 'error',
        })
      );
  };
  return (
    <>
      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Snackbar
        open={!!message}
        autoHideDuration={6000}
        onClose={() => setMessage(null)}
      >
        <Alert severity={message?.severity ?? 'success'}>
          {message?.text ?? ''}
        </Alert>
      </Snackbar>
      <Grid item xs={12}>
        <Info />
      </Grid>
      <Grid item xs={6}>
        <Trigger keysDown={triggerKeys} setKeysDown={setKeys} />
      </Grid>
      <Recorder keys={macroKeys} setKeys={setMacroKeys} />
      {macroKeys.length !== 0 && triggerKeys.length !== 0 && (
        <Grid item xs={12}>
          <Box className={classes.btnBox}>
            <Button
              size="large"
              variant="contained"
              color="primary"
              endIcon={<SaveIcon />}
              onClick={submit}
            >
              Generate
            </Button>
          </Box>
        </Grid>
      )}
    </>
  );
};

export default FormContainer;
