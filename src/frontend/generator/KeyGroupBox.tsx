/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import { makeStyles } from '@material-ui/core';
import { displayKeys } from '../helpers';

const useStyles = makeStyles((theme) => ({
  paper: {
    margin: theme.spacing(1),
  },
}));

type KeyGroupBoxProps = {
  keyGroup: Key[];
  remove: Remove;
};

interface Remove {
  (): void;
}

const KeyGroupBox = ({ keyGroup, remove }: KeyGroupBoxProps) => {
  const classes = useStyles();

  const filteredGroup = keyGroup.filter(({ type }) => type === 'keydown');
  return (
    <div className={`slideUpBtn ${classes.paper}`} onClick={remove}>
      <span>{displayKeys(filteredGroup, false)}</span>
    </div>
  );
};
export default KeyGroupBox;
