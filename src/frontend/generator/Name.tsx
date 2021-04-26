import TextField from '@material-ui/core/TextField';
import React, { FormEvent, useEffect, useState } from 'react';

const Name = () => {
  const [name, setName] = useState('');
  useEffect(() => {
    if (name.includes(' ')) {
      setName((n) => n.replace(' ', '-'));
    }
    setName((n) => n.toLowerCase());
    setName((n) => n.replace(/[^\d|\w|-]/g, ''));
  }, [name, setName]);
  return (
    <TextField
      label="Name"
      onChange={(event: FormEvent<HTMLInputElement>) =>
        setName(event.currentTarget.value)
      }
      value={name}
    />
  );
};

export default Name;
