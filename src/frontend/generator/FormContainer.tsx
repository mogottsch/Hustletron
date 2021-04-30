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
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    zIndex: 1,
  },
}));

type Message = {
  text:
    | string
    | React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLDivElement>,
        HTMLDivElement
      >;
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
  const [runScriptOnStartUp, setRunScriptOnStartUp] = useState<boolean>(false);

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
        runScriptOnStartUp,
      })
      .then((response) => {
        if (!response.success) {
          throw response.errors;
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
          text: (
            <div>
              Error generating ahk file :( <br /> {String(error)}
            </div>
          ),
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
        <Alert
          severity={message?.severity ?? 'success'}
          onClose={() => setMessage(null)}
        >
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
        <>
          <Grid item xs={12}>
            <h3> Settings</h3>
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
            <FormControlLabel
              control={
                <Checkbox
                  checked={runScriptOnStartUp}
                  onChange={() => setRunScriptOnStartUp((c) => !c)}
                  name="autorun"
                  color="primary"
                />
              }
              label="Autorun script on Windows Startup"
            />
          </Grid>
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
        </>
      )}
    </>
  );
};

export default FormContainer;
