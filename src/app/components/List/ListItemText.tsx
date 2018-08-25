// @flow
import * as React from 'react';
import {ListItemText} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

const styleSheetExport = {
  text: {
    fontSize: "14px",
  }
};


class WListItemText extends React.Component{
  constructor(props){
    super(props);
  }
  render(){
    const {...others} = this.props;
    return(
      <ListItemText {...others}/>
    );
  }
}
export default withStyles(styleSheetExport)(WListItemText);
