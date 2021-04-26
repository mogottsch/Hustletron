import { makeStyles } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { DateTime } from 'luxon';

const useStyle = makeStyles({
  muted: {
    fontSize: '12px',
    fontWeight: 100,
    color: 'grey',
    margin: '36px 13px 13px 13px',
    display: 'grid',
  },
  times: {
    gridColumnStart: 2,
    gridRowStart: 1,
    marginLeft: '5px',
  },
  heading: { display: 'inline-block' },
  header: { display: 'flex', justifyContent: 'start' },
});

const pad = (num: number) => {
  let numString = num.toString();
  while (numString.length < 2) numString = `0${numString}`;
  return numString;
};

const Info = () => {
  const classes = useStyle();
  const [now, setNow] = useState(DateTime.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(() => DateTime.now()), 1000);
    return () => clearInterval(interval);
  });

  const createdAt = DateTime.fromISO('2021-04-26T16:15:00');
  const diff = now
    .diff(createdAt, ['years', 'months', 'days', 'hours', 'minutes', 'seconds'])
    .toObject();

  return (
    <div>
      <div className={classes.header}>
        <h1 className={classes.heading}>Hustletron</h1>
        <div className={classes.muted}>
          Improving your Hustle for
          <div className={classes.times}>
            {Object.entries(diff).map(([timeCategory, value]) => {
              if (value === 0) {
                return null;
              }
              return (
                <>
                  <div key={timeCategory}>
                    {pad(Math.round(value))} {timeCategory}
                  </div>
                </>
              );
            })}
          </div>
        </div>
      </div>
      <p>
        Click on the Trigger input field and define what should trigger the
        macro. After that record the macro by clicking the start button and
        pressing all keys that the macro should record.
      </p>
    </div>
  );
};

export default Info;
