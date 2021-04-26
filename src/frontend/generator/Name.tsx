import TextField from '@material-ui/core/TextField';
import React, { FormEvent, useEffect } from 'react';

type NameProps = {
  setReady: (isReady: boolean) => void;
  setName: React.Dispatch<React.SetStateAction<string>>;
  name: string;
};

const Name = ({ setReady, setName, name }: NameProps) => {
  useEffect(() => {
    setReady(name.length !== 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  const updateName = (n: string) => {
    setName(
      n
        .toLowerCase()
        .replace(' ', '-')
        .replace(/[^\d|\w|-]/g, '')
    );
  };

  return (
    <TextField
      label="Name"
      onChange={(event: FormEvent<HTMLInputElement>) =>
        updateName(event.currentTarget.value)
      }
      value={name}
    />
  );
};

export default Name;
