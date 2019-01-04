// @flow
import { LinearProgress } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import * as React from "react";

const styleSheet = {
  root: {
    width: "100%",
  },
};

interface LinearIndeterminateProps {
  classes: any;
}

const LinearIndeterminate = (props: LinearIndeterminateProps) => {
  const classes = props.classes;
  return (
    <div className={classes.root}>
      <LinearProgress />
    </div>
  );
}
export default withStyles(styleSheet)(LinearIndeterminate);
