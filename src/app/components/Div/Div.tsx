// @flow weak

import * as React from "react";

const Div = (props) => {
  const {children, ...other} = props;
  return(
    <div
       {...other}>
      {children}
    </div>
  );
};

export default Div;
