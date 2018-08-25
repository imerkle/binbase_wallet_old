//@flow weak

import * as React from 'react';
import { Button } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import * as cx from 'classnames';

export const styleSheet = theme => ({
  fullWidth: {
    width: "100%"
  }
});

const ButtonX = (props) => {
  const {
    fullWidth: fW ,
    classes: {fullWidth, ...otherClasses},
    className,
    children,
    ...other} = props;

  return(
    <Button
       className = {cx(
         { [fullWidth]: fW },
         className
       )}
       classes={{...otherClasses}}
       {...other}
       >
      {children}
    </Button>
  );
}

export default withStyles(styleSheet)(ButtonX)
