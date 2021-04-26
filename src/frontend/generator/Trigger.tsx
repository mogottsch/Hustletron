import React, { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { TextField } from '@material-ui/core';
import { displayKeys } from '../helpers';

type TriggerProps = {
  setReady: (isReady: boolean) => void;
  setKeys: React.Dispatch<React.SetStateAction<Key[]>>;
};

const Trigger = ({ setKeys: setParentKeys, setReady }: TriggerProps) => {
  const [keys, setKeys] = useState<Key[]>([]);
  const [inputFlowActive, setInputFlowActive] = useState(false);

  const addKey = (key: Key, keysArg: Key[] = keys) => {
    if (!keysArg.find(({ code }) => code === key.code)) {
      setKeys([...keysArg, key]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.preventDefault();
    let tempKeys = keys;
    if (!inputFlowActive) {
      setInputFlowActive(true);
      tempKeys = [];
    }
    addKey(
      { name: e.key, id: uuid(), code: e.which, type: 'keydown' },
      tempKeys
    );
  };

  const handleKeyUp = () => {
    setInputFlowActive(false);
    setParentKeys(keys);
    setReady(true);
    // if (document.activeElement instanceof HTMLElement) {
    //   document.activeElement.blur();
    // }
  };

  return (
    <TextField
      label="Trigger"
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      value={displayKeys(keys, true)}
    />
  );
};

export default Trigger;
