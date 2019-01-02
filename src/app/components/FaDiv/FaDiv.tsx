// @flow weak

import { StyleRules, Theme, withStyles } from "@material-ui/core/styles";
import cx from "classnames";
import * as React from "react";
import { Div } from "../Div";

const styleSheet = (theme: Theme): StyleRules => ({
  fc: {
    display: "flex",
  },
  r: {
    "flex-flow": "row",
  },
  c: {
    "flex-flow": "column",
  },
  fa: {
    flex: "0 1 auto",
  },
  fs: {
    flex: "1 1 auto",
  },
  vcenter: {
    alignItems: "center",
  },
  hcenter: {
    justifyContent: "center",
  },
  button: {
    "user-select": "none",
  },
});
interface FaDivFlexboxProps {
  children: any;
  c?: boolean;
  fa?: boolean;
  fs?: boolean;
  button?: boolean;

  classes?: any;
  r?: any;
  vcenter?: any;
  hcenter?: any;
  className?: any;
}
class FaDivFlexbox extends React.Component<any, any> {
  public static defaultProps: Partial<FaDivFlexboxProps>  = {
      c: false,
      fa: false,
      fs: false,
      button: false,
  };
  public render() {
    const {children, classes, className, c, fa, fs, button, vcenter, hcenter, ...other} = this.props;
    return(
      <Div
        className={cx(
          classes.fc,
           {[classes.r]: !c },
           {[classes.c]: c},
           {[classes.fa]: fa },
           {[classes.fs]: fs },
           {[classes.vcenter]: vcenter },
           {[classes.hcenter]: hcenter },
           {[classes.button]: button },
          className)}
         {...other}>
        {children}
      </Div>
    );
  }
}

export default withStyles(styleSheet)(FaDivFlexbox);
