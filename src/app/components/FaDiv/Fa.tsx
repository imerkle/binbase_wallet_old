// @flow weak

import { withStyles } from "@material-ui/core/styles";
import cx from "classnames";
import * as React from "react";
import { Div } from "../Div";

const styleSheetExport = (theme) => ({
  fa: {
    flex: "0 1 auto",
  },
  fs: {
    flex: "1 1 auto",
  },
  tcenter: {
    "text-align": "center",
  },
  tr: {
    "text-align": "right",
  },
});

const FaFlexbox = (props) => {
  const {children, classes, className, fa, fs, tr, tcenter, ...other} = props;
  return(
    <Div
      className={cx(
        {[classes.tcenter]: tcenter },
        {[classes.tr]: tr },
        {[classes.fa]: (!fs) },
        {[classes.fs]: fs === true},
         className)}
       {...other}>
      {children}
    </Div>
  );
};

export default withStyles(styleSheetExport)(FaFlexbox);
