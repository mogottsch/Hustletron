/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import React from 'react';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  paper: {
    margin: theme.spacing(1),
    background: '#797474',
    color: 'white',
  },
}));

interface Remove {
  (): void;
}

type KeyBoxProps = {
  keyObject: Key;
  remove: Remove;
  showType: boolean;
};

const KeyBox = ({ keyObject, remove, showType = false }: KeyBoxProps) => {
  const classes = useStyles();

  return (
    <div className={`slideUpBtn ${classes.paper}`} onClick={remove}>
      <span>
        {showType && (
          <>
            {keyObject.type === 'keydown' ? (
              <KeyboardArrowDownIcon fontSize="small" />
            ) : (
              <KeyboardArrowUpIcon fontSize="small" />
            )}
          </>
        )}
        {keyObject.name}
      </span>
    </div>
  );
};
export default KeyBox;
