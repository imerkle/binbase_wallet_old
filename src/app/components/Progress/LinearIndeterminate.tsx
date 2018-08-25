// @flow
import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { LinearProgress } from '@material-ui/core';

const styleSheet = {
  root: {
    width: '100%'
  },
};

interface LinearIndeterminateProps{
  classes: any,
}

function LinearIndeterminate(props: LinearIndeterminateProps) {
  const classes = props.classes;
  return (
    <div className={classes.root}>
      <LinearProgress />
    </div>
  );
}
export default withStyles(styleSheet)(LinearIndeterminate);
