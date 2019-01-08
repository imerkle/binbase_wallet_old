// @flow weak

import * as React from "react";

import { TextField } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";

export const styleSheet = (theme) => ({
  disabled: {},
  /*
  underline: {
    "&:hover:not($disabled):before": {
      backgroundColor: theme.palette.primary.main,
      height: 1,
    },
  },
  */
});

class TextFieldX extends React.Component<any> {

  public render() {
    const {
      //withUnderline,
      classes,
      InputProps,
      children,
      ...other
    } = this.props;

    let IP;
    if (!InputProps) {
      IP = {};
    } else {
      IP = InputProps;
    }
    const {classes: classesInputProps, ...otherInputProps} = IP;

    return(
      <TextField

          InputProps={{
              classes: {
                ...classesInputProps,
                disabled: classes.disabled,
                //underline: classes.underline,
              },
              ...otherInputProps,
            }}
          variant="outlined"
         {...other}
         >
        {children}
      </TextField>
    );
  }
}

export default withStyles(styleSheet)(TextFieldX);
