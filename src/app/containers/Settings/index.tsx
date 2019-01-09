// @flow
import { Divider, List, ListItem, ListItemText,Icon, IconButton, Paper, Typography, Tooltip } from "@material-ui/core";
import { AButton, Div, Fa, FaDiv, TextField } from "app/components";
import cx from "classnames";
import { inject, observer } from "mobx-react";
import * as React from "react";
import * as stylesg from "../../style.css";
import * as styles from "./style.css";
import { Scrollbars } from "react-custom-scrollbars";

const settingMenu = [
    "My Account",
    "Backup & Restore",
];
@inject("rootStore")
@observer
class Settings extends React.Component<any, any> {
    public state = {
        passphrase: "",
        mnemonic_copy: "",
        mnemonic_paste: "",
        passphrase_paste: "",
        passphrase_unlock: "",
        selectedIndex: 0, 
    };
    public unlockWallet = async () => {
        await this.props.rootStore.coinStore.generateKeys(false, this.state.passphrase_unlock);
        this.props.rootStore.appStore.setSnackMsg("Wallet unlocked!");
    }
    public generateNewWallet = async () => {
        const mnemonic = await this.props.rootStore.coinStore.generateKeys(true, this.state.passphrase);
        this.props.rootStore.appStore.setSnackMsg("New Wallet Generated!");
        this.setState({ mnemonic_copy: mnemonic });
    }
    public restoreWallet = async () => {
        const mnemonic = await this.props.rootStore.coinStore.generateKeys(false, this.state.passphrase_paste, this.state.mnemonic_paste);
        this.props.rootStore.appStore.setSnackMsg("Wallet restored!");
    }
    handleListItemClick = (e, i) => {
        this.setState({selectedIndex: i})
    }
    public render() {
        const { appStore, coinStore } = this.props.rootStore;
        const { mnemonic_copy, selectedIndex } = this.state;
        return (
            <div className={cx(styles.root)}>
                <FaDiv className={cx(styles.col1)}>
                    <List>
                        {settingMenu.map((o, i)=>{
                            return (
                                <ListItem
                                    className={cx(styles.listitem)}
                                    button
                                    selected={this.state.selectedIndex === i}
                                    onClick={event => this.handleListItemClick(event, i)}
                                    key={i}
                                >
                                    <ListItemText primary={o} />
                                </ListItem>
                            )
                        })}
                    </List>
                </FaDiv>
                <Scrollbars className={cx(styles.col2)}>
                    <div style={{ padding: "65px 25px 60px 25px"}}>
                    {selectedIndex == 0 && !coinStore.isUnlocked &&
                        <>
                            <Typography className={cx(stylesg.h4)} variant="h4">Unlock Wallet</Typography>
                            <TextField
                                className={cx(stylesg.mar_10_0)}
                                value={this.state.passphrase_unlock}
                                onChange={(e) => { this.setState({ passphrase_unlock: e.target.value }); }}
                                label={`Your Passphrase`}
                                type="text"
                                fullWidth={true}
                            />
                            <AButton
                                className={cx(stylesg.mar_10_0)}
                                variant="contained" color="secondary"
                                onClick={this.unlockWallet}>Unlock Wallet</AButton>
                        </>
                    }
                    {selectedIndex == 1 &&
                    <>
                        <>
                            <Typography className={cx(stylesg.h4)} variant="h4">Generate New Wallet</Typography>
                            <TextField
                                className={cx(stylesg.mar_10_0)}
                                value={this.state.passphrase}
                                onChange={(e) => { this.setState({ passphrase: e.target.value }); }}
                                label={`New Passphrase`}
                                type="text"
                                fullWidth={true}
                            />

                            {this.state.mnemonic_copy &&
                                <Div>
                                <Typography className={cx(stylesg.h5)} variant="h5">Generated Mnemonic</Typography>
                                <Typography className={cx(stylesg.caption)} variant="caption">Backup this 24 word mnemonic phrase carefully</Typography>
                                    <FaDiv vcenter={true}>
                                    <Paper className={cx(stylesg.mar_10_0, stylesg.pad_20)}>{this.state.mnemonic_copy}</Paper>
                                        <TextField
                                            className={cx(stylesg.invisible)}
                                            value={mnemonic_copy}
                                            id="mnemonic"
                                            type="text" />
                                        <IconButton onClick={() => {
                                            let textArea = document.getElementById("mnemonic");
                                            // @ts-ignore
                                            textArea.select();
                                            let range = document.createRange();
                                            range.selectNodeContents(textArea);
                                            window.getSelection().addRange(range);
                                            document.execCommand("copy");
                                            appStore.setSnackMsg("Mnemonic phrase copied to clipboard");
                                        }}>
                                            <Icon className={cx(stylesg.icon)}>file_copy</Icon>
                                        </IconButton>
                                    </FaDiv>
                                </Div>
                            }
                            <AButton
                                className={cx(stylesg.mar_10_0)}
                                variant="contained" color="primary"
                                onClick={this.generateNewWallet}>Generate New Wallet</AButton>
                        </>
                        <Divider className={cx(stylesg.divider)} />
                        <>
                            <Typography className={cx(stylesg.h4)} variant="h4">Restore Wallet</Typography>
                            <TextField
                                className={cx(stylesg.mar_10_0)}
                                rowsMax="4"
                                value={this.state.mnemonic_paste}
                                onChange={(e) => { this.setState({ mnemonic_paste: e.target.value }); }}
                                label={`Write your mnemonic phrase`}
                                type="text"
                                multiline={true}
                                fullWidth={true}
                            />
                            <TextField
                                className={cx(stylesg.mar_10_0)}
                                value={this.state.passphrase_paste}
                                onChange={(e) => { this.setState({ passphrase_paste: e.target.value }); }}
                                label={`Your Passphrase`}
                                type="text"
                                fullWidth={true}
                            />
                            <AButton
                                className={cx(stylesg.mar_10_0)}
                                variant="contained" color="secondary"
                                onClick={this.restoreWallet}>Restore Wallet</AButton>
                        </>
                    </>
                    }
            </div>
            </Scrollbars>
            <div className={cx(styles.col3)}>
                <Tooltip title={"Close Settings"} aria-label={"Close Settings"}>
                    <IconButton className={cx(stylesg.icon_border)} onClick={appStore.toggleSettings}>
                            <Icon className={cx(stylesg.icon)} style={{fontSize: 24,}}>close</Icon>
                    </IconButton>
                </Tooltip>
            </div>
        </div>
        );
    }
}
export default Settings;
