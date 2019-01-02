// @flow weak

import { Button } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import cx from "classnames";
import * as React from "react";

export const styleSheet = (theme) => ({
  fullWidth: {
    width: "100%",
  },
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
       className={cx(
         { [fullWidth]: fW },
         className,
       )}
       classes={{...otherClasses}}
       {...other}
       >
      {children}
    </Button>
  );
};

export default withStyles(styleSheet)(ButtonX);
