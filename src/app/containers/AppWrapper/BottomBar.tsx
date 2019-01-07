import { inject, observer } from "mobx-react";
import * as React from 'react';
import { FaDiv, Fa } from "app/components";
import { Tooltip, IconButton, Icon } from "@material-ui/core";
import cx from 'classnames';
import * as styles from "./style.css";

@inject("rootStore")
@observer
class BottomBar extends React.Component<any, any> {
    render() {
        const { appStore } = this.props.rootStore;
        const icon_style = { color: "#a7a7a7", fontSize: 14, };
        const label = !appStore.slideLeft ? "Hide Sidebar" : "Show Sidebar";
        const icon_label = !appStore.slideLeft ? "arrow_back_io" : "arrow_forward";
        return (
            <FaDiv vcenter={true} className={cx(styles.col2_bottom)}>
                <Tooltip title={label} aria-label={label}>
                    <Fa fa={true} onClick={appStore.toggleSlide}>
                        <IconButton color="primary" >
                            <Icon style={icon_style}>{icon_label}</Icon>
                        </IconButton>
                    </Fa>
                </Tooltip>
                <Tooltip title={"Settings"} aria-label={"Settings"}>
                    <Fa fa={true} onClick={appStore.toggleSettings}>
                        <IconButton color="primary" >
                            <Icon style={icon_style}>settings</Icon>
                        </IconButton>
                    </Fa>
                </Tooltip>                
            </FaDiv>
        )
    }
}
export default BottomBar;