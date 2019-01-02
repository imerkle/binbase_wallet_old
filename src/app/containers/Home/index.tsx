// @flow
import {Icon, IconButton, Paper, Typography} from "@material-ui/core";
import { AButton, Div, Fa, FaDiv, TextField } from "app/components";
import cx from "classnames";
import { inject, observer } from "mobx-react";
import * as React from "react";
import * as stylesg from "../../style.css";

@inject("rootStore")
@observer
class Home extends React.Component<any, any> {
    public state = {
        passphrase: "",
        mnemonic_copy: "",
        mnemonic_paste: "",
        passphrase_paste: "",
        passphrase_unlock: "",
    };
    public unlockWallet = async () => {
        await this.props.rootStore.coinStore.generateKeys(false, this.state.passphrase_unlock);
        this.props.rootStore.appStore.setSnackMsg("Wallet unlocked!");
    }
    public generateNewWallet = async () => {
        const mnemonic = await this.props.rootStore.coinStore.generateKeys(true, this.state.passphrase);
        this.props.rootStore.appStore.setSnackMsg("New Wallet Generated!");
        this.setState({mnemonic_copy: mnemonic});
    }
    public restoreWallet = async () => {
        const mnemonic = await this.props.rootStore.coinStore.generateKeys(false, this.state.passphrase_paste, this.state.mnemonic_paste);
        this.props.rootStore.appStore.setSnackMsg("Wallet restored!");
    }
    public render() {
        const {appStore, coinStore} = this.props.rootStore;
        const {mnemonic_copy} = this.state;

        return (
        <FaDiv fs={true} c={true}>
           {!coinStore.isUnlocked &&
            <FaDiv fs={true} c={true} className={cx(stylesg.mar_20)}>
              <Typography variant="h4">Unlock Wallet</Typography>
              <TextField
                className={cx(stylesg.mar_20_0)}
                value={this.state.passphrase_unlock}
                onChange={(e) => { this.setState({passphrase_unlock: e.target.value }); }}
                label={`Your Passphrase`}
                type="text"
                fullWidth={true}
              />
              <AButton
              className={cx(stylesg.mar_20_0, stylesg.pad_20)}
              variant="contained" color="secondary"
              onClick={this.unlockWallet}>Unlock Wallet</AButton>
            </FaDiv>
            }
            <FaDiv>
                <FaDiv fs={true} c={true} className={cx(stylesg.mar_0_20)} style={{flex: 0.5}}>
                  <Typography variant="h4">Generate New Wallet</Typography>
                  <TextField
                    className={cx(stylesg.mar_20_0)}
                    value={this.state.passphrase}
                    onChange={(e) => { this.setState({passphrase: e.target.value }); }}
                    label={`New Passphrase`}
                    type="text"
                    fullWidth={true}
                  />

                  {this.state.mnemonic_copy &&
                    <Div>
                     <Typography variant="h5">Generated Mnemonic</Typography>
                     <Typography variant="caption">Backup this 24 word mnemonic phrase carefully</Typography>
                    <FaDiv vcenter={true}>
                        <Paper className={cx(stylesg.mar_20_0, stylesg.pad_20)}>{this.state.mnemonic_copy}</Paper>
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
                      }}color="primary" ><Icon style={{fontSize: 14}} >file_copy</Icon></IconButton>
                    </FaDiv>
                    </Div>
                  }
                  <AButton
                  className={cx(stylesg.mar_20_0, stylesg.pad_20)}
                  variant="contained" color="primary"
                  onClick={this.generateNewWallet}>Generate New Wallet</AButton>
                </FaDiv>
                <FaDiv fs={true} c={true} style={{flex: 0.5}}>
                  <Typography variant="h4">Restore Wallet</Typography>
                  <TextField
                    className={cx(stylesg.mar_20_0)}
                    rowsMax="4"
                    value={this.state.mnemonic_paste}
                    onChange={(e) => { this.setState({mnemonic_paste: e.target.value }); }}
                    label={`Write your mnemonic phrase`}
                    type="text"
                    multiline={true}
                    fullWidth={true}
                  />
                  <TextField
                    className={cx(stylesg.mar_20_0)}
                    value={this.state.passphrase_paste}
                    onChange={(e) => { this.setState({passphrase_paste: e.target.value }); }}
                    label={`Your Passphrase`}
                    type="text"
                    fullWidth={true}
                  />
                  <AButton
                  className={cx(stylesg.mar_20_0, stylesg.pad_20)}
                  variant="contained" color="secondary"
                  onClick={this.restoreWallet}>Restore Wallet</AButton>
                </FaDiv>
            </FaDiv>
        </FaDiv>
            );
    }
}
export default Home;
