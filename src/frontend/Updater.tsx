import { Backdrop, Box, Button, Grid, Link } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import LinearProgress from '@material-ui/core/LinearProgress';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { ipcRenderer } from 'electron';
import React, { useEffect, useState } from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  backdrop: {
    zIndex: 1,
  },
  card: {
    padding: '30px 20px',
  },
  updateText: {
    margin: '20px',
  },
  buttonDialog: {
    display: 'flex',
    flexDirection: 'column',
  },
  updateButton: {
    marginTop: '15px',
    width: '100%',
  },
}));
const Updater = () => {
  const [updating, setUpdating] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const [ahkInstalled, setAhkInstalled] = useState(true);

  const checkRequirements = () => {
    ipcRenderer
      .invoke('requirements_check')
      .then((response) => {
        setAhkInstalled(response.ahkInstalled);
        return response;
      })
      .catch(() => setAhkInstalled(true));
  };

  useEffect(() => {
    checkRequirements();

    ipcRenderer.on('update_available', () => {
      ipcRenderer.removeAllListeners('update_available');
      setUpdating(true);
    });
    ipcRenderer.on('update_downloaded', () => {
      ipcRenderer.removeAllListeners('update_downloaded');
      setDownloaded(true);
    });

    return () => {
      ipcRenderer.removeAllListeners('update_available');
      ipcRenderer.removeAllListeners('update_downloaded');
    };
  }, []);

  const classes = useStyles();
  return (
    <Backdrop className={classes.backdrop} open={updating || !ahkInstalled}>
      <Card className={classes.card}>
        {updating ? (
          <>
            <div className={classes.updateText}>
              {!downloaded ? (
                <span>An update is available. Downloading...</span>
              ) : (
                <div className={classes.buttonDialog}>
                  <div>The update was downloaded. Restart now?</div>
                  <Button
                    className={classes.updateButton}
                    variant="contained"
                    color="primary"
                    onClick={() => ipcRenderer.send('restart_app')}
                  >
                    Restart
                  </Button>
                </div>
              )}
            </div>
            {!downloaded && <LinearProgress />}
          </>
        ) : (
          <Box className={classes.buttonDialog}>
            <Box>
              Hustletron requires <b>AutoHotkey </b> to be installed.
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button
                  className={classes.updateButton}
                  variant="contained"
                  color="primary"
                  onClick={() => window.open('https://www.autohotkey.com/')}
                >
                  Download Now
                </Button>
              </Grid>

              <Grid item xs={6}>
                <Button
                  className={classes.updateButton}
                  variant="contained"
                  // color="primary"
                  onClick={checkRequirements}
                >
                  Check Installation
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </Card>
    </Backdrop>
  );
};
export default Updater;
