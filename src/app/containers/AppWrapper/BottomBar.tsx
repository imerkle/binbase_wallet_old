import { inject, observer } from "mobx-react";
import * as React from 'react';
import { FaDiv, Fa } from "app/components";
import { Tooltip, IconButton, Icon } from "@material-ui/core";
import cx from 'classnames';
import * as styles from "./style.css";
import * as stylesg from "../../style.css";

@inject("rootStore")
@observer
class BottomBar extends React.Component<any, any> {
    render() {
        const { appStore } = this.props.rootStore;
        return (
            <FaDiv vcenter={true} className={cx(styles.col2_bottom)}>
                <Tooltip title={"Settings"} aria-label={"Settings"}>
                    <Fa fa={true} onClick={appStore.toggleSettings}>
                        <IconButton>
                            <Icon className={cx(stylesg.icon)}>settings</Icon>
                        </IconButton>
                    </Fa>
                </Tooltip>                
            </FaDiv>
        )
    }
}
export default BottomBar;