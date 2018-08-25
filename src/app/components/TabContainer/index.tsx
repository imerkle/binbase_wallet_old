import * as React  from 'react';
import { Div } from 'app/components';

const TabContainer = (props) => 
  (<Div style={{minHeight: props.swipeableHeight}} className={props.className}>
    {props.children}
  </Div>)

export default TabContainer;