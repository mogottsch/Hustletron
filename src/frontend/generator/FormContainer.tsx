import {
  Backdrop,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  Snackbar,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import SaveIcon from '@material-ui/icons/Save';
import Alert, { Color } from '@material-ui/lab/Alert';
import { ipcRenderer } from 'electron';
import React, { useState } from 'react';
import { sortKeys } from '../helpers';
import Name from './Name';
import Recorder from './Recorder';
import Trigger from './Trigger';

const useStyles = makeStyles(() => ({
  btnBox: {
    display: 'flex',
    justifyContent: 'start',
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
  const [formReady, setFormReady] = useState<FormReady>({
    trigger: false,
    recorder: false,
    name: false,
  });
  const [macroKeys, setMacroKeys] = useState<Key[]>([]);
  const [triggerKeys, setKeys] = useState<Key[]>([]);
  const [name, setName] = useState<string>('');
  const [autoRunScript, setAutoRunScript] = useState<boolean>(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const submit = () => {
    setLoading(true);
    ipcRenderer
      .invoke('generate-ahk-file', {
        triggerKeys: sortKeys(triggerKeys),
        macroKeys,
        name,
        autoRunScript,
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

  const submittable = Object.values(formReady).reduce(
    (ready, curr) => ready && curr,
    true
  );

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
      <Grid item xs={4}>
        <Trigger
          setReady={(isReady: boolean) =>
            setFormReady((c) => ({ ...c, trigger: isReady }))
          }
          setKeys={setKeys}
        />
      </Grid>
      <Grid item xs={4}>
        <Name
          name={name}
          setName={setName}
          setReady={(isReady: boolean) =>
            setFormReady((c) => ({ ...c, name: isReady }))
          }
        />
      </Grid>
      <Recorder
        setReady={(isReady: boolean) =>
          setFormReady((c) => ({ ...c, recorder: isReady }))
        }
        setKeys={setMacroKeys}
      />
      {submittable && (
        <Grid item xs={12}>
          <Box className={classes.btnBox}>
            <Box mr={2}>
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
            <FormControlLabel
              control={
                <Checkbox
                  checked={autoRunScript}
                  onChange={() => setAutoRunScript((c) => !c)}
                  name="autorun"
                  color="primary"
                />
              }
              label="Autorun script after generation"
            />
          </Box>
        </Grid>
      )}
    </>
  );
};

export default FormContainer;
