// @flow
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import { Fa, FaDiv, Div, AButton, TextField } from 'app/components';
import * as stylesg from '../../style.css';
import cx from 'classnames';

@inject('rootStore')
@observer
class Home extends React.Component<any, any>{
    state = {
        passphrase: "",
    }
    generateNewWallet = () => {
      return new Promise(async (resolve, reject) => {        
        const mnemonic = await this.props.rootStore.coinStore.generateKeys(true, this.state.passphrase);
        this.props.rootStore.appStore.setSnackMsg("New Wallet Generated!");
        resolve();
      });
    }
    render() {
        return (
            <Div>
                <FaDiv fs c>
                  <h2>Generate New Wallet</h2>
                  <TextField
                    className={cx(stylesg.mar_20_0)}
                    value={this.state.passphrase}
                    onChange={(e)=>{ this.setState({passphrase: e.target.value }) }}
                    label={`New Passphrase`}
                    type="text" 
                    fullWidth
                  />
                  <AButton 
                  className={cx(stylesg.mar_20_0,stylesg.pad_20)}
                  variant="contained" color="primary"
                  onClick={this.generateNewWallet}>Generate New Wallet</AButton>
                </FaDiv>
            </Div>
            );
    }
}
export default Home;
