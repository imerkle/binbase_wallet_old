// @flow weak

import * as React from "react";

const Span = (props) => {
  const {children, ...other} = props;
  return(
    <span
       {...other}>
      {children}
    </span>
  );
};

export default Span;
