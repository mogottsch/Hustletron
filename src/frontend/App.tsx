import React from 'react';
import './css/App.global.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Container, Grid, Box, CssBaseline } from '@material-ui/core';
import { makeStyles, styled } from '@material-ui/core/styles';
import FormContainer from './generator/FormContainer';
import Info from './generator/Info';
import Updater from './Updater';
import hustletronbot from '../../assets/hustletronbot.png';

const WhiteBox = styled(Box)({
  background: 'white',
  borderRadius: '4px',
});

const useStyles = makeStyles({
  root: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
  },
  hustletronbot: {
    position: 'fixed',
    bottom: '0px',
    right: '0px',
    width: 'min(50vw, 50vh)',
    zIndex: -1,
  },
});

const Generator = () => {
  const classes = useStyles();
  return (
    <Container className={classes.root} maxWidth="sm">
      <img className={classes.hustletronbot} alt="icon" src={hustletronbot} />
      <WhiteBox p={2}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Info />
          </Grid>
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
      <Updater />
      <Router>
        <Switch>
          <Route path="/" component={Generator} />
        </Switch>
      </Router>
    </>
  );
}
