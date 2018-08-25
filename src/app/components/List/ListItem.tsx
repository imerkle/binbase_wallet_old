// @flow
import * as React from 'react';
import {List,ListItem} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import * as cx from 'classnames';

import Fa from '../FaDiv/Fa';

const styleSheetExport = {
  gutters: {
    padding: "4px 16px"
  },
};

const AList = (props) => {
  const {classes, className, isVisible, dense,...other} = props;
  return(
    <List className={cx(
      classes.root,
      {[classes.visible]: isVisible},
      {[classes.invisible]: !isVisible},
      className
    )}
    {...other}>
      {other.children}
    </List>
  );
}

const AnimateList = withStyles({
  root: {
    "transition": ".15s linear max-height",
    "overflow": "hidden"
  },
  visible: {
    "max-height": "350px"
  },
  invisible: {
    "max-height": "0",
    "padding": "0px",

  }
})(AList);

class WListItem extends React.Component<any ,any>{
  state = {
     isVisible: false
  };  
  static defaultProps = {
    nestedItems: [],
    dense: true,
  }
  render(){
    const {nestedItems, dense,...others} = this.props;
    let nest;
    if(nestedItems.length > 0){
      nest = (
        <AnimateList isVisible={this.state.isVisible}>
          {nestedItems.map((n)=>{
            return n;
          })}
        </AnimateList>
      );
      //@ts-ignore
      others.onClick = () => {
        this.setState({
          isVisible: !this.state.isVisible
        });
      };
    }
    let out;
    if(nest){
      out = (<ListItem dense={dense} {...others}>
        <Fa>
          {others.children}
        </Fa>
        <Fa fs>
          {nest}
        </Fa>
      </ListItem>)
    }else{
        out = (
          <ListItem dense={dense} {...others}>
            {others.children}
          </ListItem>
        )
    }
    return( out );
  }
}
export default withStyles(styleSheetExport)(WListItem);
