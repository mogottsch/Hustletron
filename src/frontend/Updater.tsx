import { Backdrop, Button } from '@material-ui/core';
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
  restartDialog: {
    display: 'flex',
    flexDirection: 'column',
  },
  updateButton: {
    marginTop: '15px',
  },
}));
const Updater = () => {
  const [updating, setUpdating] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  useEffect(() => {
    ipcRenderer.on('update_available', () => {
      ipcRenderer.removeAllListeners('update_available');
      setUpdating(true);
    });
    ipcRenderer.on('update_downloaded', () => {
      ipcRenderer.removeAllListeners('update_downloaded');
      setDownloaded(true);
    });
  });
  const classes = useStyles();
  return (
    <Backdrop className={classes.backdrop} open={updating}>
      <Card className={classes.card}>
        <div className={classes.updateText}>
          {!downloaded ? (
            <span>An update is available. Downloading...</span>
          ) : (
            <div className={classes.restartDialog}>
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
      </Card>
    </Backdrop>
  );
};
export default Updater;
