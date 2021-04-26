import React, { useEffect, useRef, useState } from 'react';
import { Button, Box, Grid } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { v4 as uuid } from 'uuid';
import KeyBox from './KeyBox';
import KeyGroupBox from './KeyGroupBox';

const useStyles = makeStyles((theme: Theme) => ({
  btnBox: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  btnChildren: {
    marginRight: theme.spacing(1),
  },
  heading: {
    marginBottom: '0px',
  },
}));

type RecorderProps = {
  setReady: (isReady: boolean) => void;
  setKeys: React.Dispatch<React.SetStateAction<Key[]>>;
};

const Recorder = ({ setKeys: setParentKeys, setReady }: RecorderProps) => {
  const classes = useStyles();
  const [keys, setKeys] = useState<Key[]>([]);
  const [inputFlowActive, setInputFlowActive] = useState(false);
  const pressedKeysRef = useRef<Key[]>([]);

  useEffect(() => {
    const pressKey = (key: Key) => {
      if (pressedKeysRef.current.some(({ code }) => code === key.code)) {
        return;
      }
      setKeys((k) => [...k, key]);
      pressedKeysRef.current.push(key);
    };

    const releaseKey = (key: Key) => {
      const index = pressedKeysRef.current.findIndex(
        ({ code }) => code === key.code
      );
      if (index === -1) {
        return;
      }
      setKeys((k) => [...k, key]);
      pressedKeysRef.current.splice(index, 1);
    };
    const handleKeyEvent = (e: KeyboardEvent) => {
      e.preventDefault();
      const key = { type: e.type, name: e.key, code: e.which, id: uuid() };
      if (e.type === 'keydown') {
        pressKey(key);
        return;
      }
      if (e.type === 'keyup') {
        releaseKey(key);
      }
    };

    if (inputFlowActive) {
      window.addEventListener('keydown', handleKeyEvent);
      window.addEventListener('keyup', handleKeyEvent);
    } else {
      window.removeEventListener('keydown', handleKeyEvent);
      window.removeEventListener('keyup', handleKeyEvent);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyEvent);
      window.removeEventListener('keyup', handleKeyEvent);
    };
  }, [inputFlowActive, setKeys]);

  const toggleRecord = () => {
    if (!inputFlowActive) {
      setKeys([]);
      setReady(false);
    }
    if (inputFlowActive) {
      setReady(true);
      setParentKeys(keys);
    }
    setInputFlowActive((b) => !b);
  };

  const removeKey = (findId: string) => {
    let index = keys.findIndex(({ id }) => id === findId);
    if (index !== -1) {
      setKeys((k) => {
        index = k.findIndex(({ id }) => id === findId);
        return [...k.slice(0, index), ...k.slice(index + 1)];
      });
    }
  };

  const removeGroup = (group: Key[]) => {
    group.forEach((key: Key) => removeKey(key.id));
  };

  const keyPreview: KeyGroups = keys.reduce(
    (prev: KeyGroups, curr: Key): KeyGroups => {
      if (prev.groupMasterCode == null) {
        return { ...prev, groupMasterCode: curr.code, currentGroup: [curr] };
      }
      if (curr.type === 'keyup' && curr.code === prev.groupMasterCode) {
        return {
          groups: [...prev.groups, [...prev.currentGroup, curr]],
          currentGroup: [],
          groupMasterCode: null,
        };
      }
      return { ...prev, currentGroup: [...prev.currentGroup, curr] };
    },
    {
      groups: [],
      currentGroup: [],
      groupMasterCode: null,
    }
  );

  return (
    <>
      <Grid item xs={4}>
        <Box className={classes.btnBox}>
          <Button
            variant="outlined"
            size="large"
            color="secondary"
            onClick={toggleRecord}
          >
            <span className={classes.btnChildren}>
              {inputFlowActive && 'Stop'}
              {!inputFlowActive && (keys.length ? 'Restart' : 'Start')}
            </span>
            <div className={`radiusPulse ${inputFlowActive ? 'active' : ''}`} />
          </Button>
        </Box>
      </Grid>
      {!!keys.length && (
        <>
          <Grid item xs={12}>
            <h3 className={classes.heading}> Keystrokes</h3>
          </Grid>
          <Grid item xs={12}>
            <Box>
              {keys.map((key) => (
                <KeyBox
                  keyObject={key}
                  key={key.id}
                  remove={() => removeKey(key.id)}
                  showType
                />
              ))}
            </Box>
          </Grid>
          <Grid item xs={12}>
            <h3 className={classes.heading}> Preview</h3>
          </Grid>
          <Grid item xs={12}>
            <Box>
              {keyPreview.groups.map((group) => (
                <KeyGroupBox
                  keyGroup={group}
                  key={uuid()}
                  remove={() => removeGroup(group)}
                />
              ))}
            </Box>
          </Grid>
        </>
      )}
    </>
  );
};

export default Recorder;
