import React from 'react';
import './css/App.global.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import {
  Container,
  makeStyles,
  styled,
  Grid,
  Box,
  CssBaseline,
} from '@material-ui/core';

import FormContainer from './generator/FormContainer';

const WhiteBox = styled(Box)({
  background: 'white',
  borderRadius: '4px',
});

const useStyles = makeStyles({
  root: {
    marginTop: '64px',
  },
});

const Hello = () => {
  const classes = useStyles();
  return (
    <Container className={classes.root} maxWidth="sm">
      <WhiteBox p={2}>
        <Grid container spacing={2}>
          <FormContainer />
        </Grid>
      </WhiteBox>
    </Container>
  );
};

export default function App() {
  return (
    <>
      <CssBaseline />
      <Router>
        <Switch>
          <Route path="/" component={Hello} />
        </Switch>
      </Router>
    </>
  );
}
