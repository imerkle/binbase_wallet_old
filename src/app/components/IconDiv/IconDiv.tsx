//@flow weak

import * as React from 'react';
import {IconButton, Icon} from '@material-ui/core';
import { default as FaDiv, Fa} from '../FaDiv';

class IconDiv extends React.Component<any>{

  static defaultProps = {
    icon: 'close'
  }
  constructor(props){
    super(props);
  }
  render(){
    const {children, icon, onIconClick,...other} = this.props;

    return (
      <FaDiv {...other}>
        <Fa fs>
          {children}
        </Fa>
        <Fa>
          <IconButton onClick={onIconClick}><Icon>{icon}</Icon></IconButton>
        </Fa>
      </FaDiv>
    );
  }
}
export default IconDiv;
