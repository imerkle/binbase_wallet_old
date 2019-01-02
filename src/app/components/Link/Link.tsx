// @flow weak

import * as React from "react";

import { withStyles } from "@material-ui/core/styles";
import cx from "classnames";
import { Link } from "react-router-dom";

export const styleSheet = (theme) => ({
  root: {
    "color": theme.palette.text.primary,
    "textDecoration": "none",
    "paddingBottom": "5px",
    "borderBottom": `2px solid transparent`,
    "&:hover": {
      borderColor: theme.palette.text.primary,
    },
  },
  clearfix: {
    "borderBottom": `0px solid transparent`,
    "textDecoration": "none",
    "outline": "none",
    "&:hover": {
      borderColor: "transparent",
    },
  },
  faded: {
    "transition": ".15s linear color",
    "color": theme.palette.text.hint,
    "&:hover": {
      color: theme.palette.text.primary,
      textDecoration: "none",
      borderColor: `transparent`,
    },
  },
});

const LinkX = (props) => {
  const {
    faded,
    classes,
    className,
    children,
    clearfix,
    ...other
  } = props;
  return(
    <Link
       className={cx(
         { [classes.clearfix]: clearfix},
         { [classes.root]: clearfix},
         { [classes.faded] : faded },
         className,
       )}
       {...other}
       >
      {children}
    </Link>
  );
  /*
  LinkX.defaultProps = {
    children: null,
  }
  LinkX.propTypes = {
    classes: PropTypes.object.isRequired,
    children: PropTypes.node,
  }
  */
};

export default withStyles(styleSheet)(LinkX);
