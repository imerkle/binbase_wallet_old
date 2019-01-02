// @flow weak

import {Icon, IconButton} from "@material-ui/core";
import * as React from "react";
import { default as FaDiv, Fa} from "../FaDiv";

class IconDiv extends React.Component<any> {

  public static defaultProps = {
    icon: "close",
  };
  constructor(props) {
    super(props);
  }
  public render() {
    const {children, icon, onIconClick, ...other} = this.props;

    return (
      <FaDiv {...other}>
        <Fa fs={true}>
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
