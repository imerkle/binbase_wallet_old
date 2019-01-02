import { Div } from "app/components";
import * as React  from "react";

const TabContainer = (props) =>
  (<Div style={{minHeight: props.swipeableHeight}} className={props.className}>
    {props.children}
  </Div>);

export default TabContainer;
