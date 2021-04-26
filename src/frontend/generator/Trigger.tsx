import React, { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { TextField } from '@material-ui/core';
import { displayKeys } from '../helpers';

type TriggerProps = {
  keysDown: Key[];
  setKeysDown: React.Dispatch<React.SetStateAction<Key[]>>;
};

const Trigger = ({ keysDown, setKeysDown }: TriggerProps) => {
  const [inputFlowActive, setInputFlowActive] = useState(false);

  const addKey = (key: Key, keys: Key[] = keysDown) => {
    if (!keys.find(({ code }) => code === key.code)) {
      setKeysDown([...keys, key]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.preventDefault();
    let tempKeysDown = keysDown;
    if (!inputFlowActive) {
      setInputFlowActive(true);
      tempKeysDown = [];
    }
    addKey(
      { name: e.key, id: uuid(), code: e.which, type: 'keydown' },
      tempKeysDown
    );
  };

  const handleKeyUp = () => {
    setInputFlowActive(false);
    // if (document.activeElement instanceof HTMLElement) {
    //   document.activeElement.blur();
    // }
  };

  return (
    <TextField
      label="Trigger"
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      value={displayKeys(keysDown, true)}
    />
  );
};

export default Trigger;
