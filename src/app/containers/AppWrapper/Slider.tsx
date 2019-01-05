import { inject, observer } from "mobx-react";
import * as React from 'react';
import { FaDiv, Fa } from "app/components";
import { Tooltip, IconButton, Icon } from "@material-ui/core";
import cx from 'classnames';
import * as styles from "./style.css";

@inject("rootStore")
@observer
class Slider extends React.Component<any, any> {
    render(){
        const {appStore} = this.props.rootStore;
        const icon_style = { color: "#a7a7a7", fontSize: 14,};
        const label = !appStore.slideLeft ? "Hide Sidebar" : "Show Sidebar";
        const icon_label = !appStore.slideLeft ? "arrow_back_io" : "arrow_forward";
        return (
            <FaDiv vcenter={true} className={cx(styles.slide_bar, { [styles.visible]: appStore.slideLeft})}>
                <Tooltip title={label} aria-label={label}>
                    <Fa fa={true} onClick={this.toggleSlide}>
                        <IconButton color="primary" >
                            <Icon style={icon_style}>{icon_label}</Icon>
                        </IconButton>
                    </Fa>
                </Tooltip>
            </FaDiv>
        )
    }
    toggleSlide = (): void => {
        const {appStore} = this.props.rootStore;
        appStore.toggleSlide();
    }
}
export default Slider;