import * as React from 'react';
import { observer, inject } from 'mobx-react';

import { Fa, FaDiv, Div, TextField } from 'app/components';
import { Switch } from '@material-ui/core';
import Slider from '@material-ui/lab/Slider';

import * as styles from './style.css';
import * as stylesg from '../../style.css';
import * as cx from 'classnames';
import { config, getAtomicValue } from 'app/constants';

@inject('rootStore')
@observer
class FeeBox extends React.Component<any, any>{
    state = {
        showAdvanced: false,
        showFees: true,
        advanceToggleDisabled: false,        
    }
    componentDidMount(){
        this.setConfigs();
    }
    setConfigs = () =>{ 
        const { exchangeStore } = this.props.rootStore;
        const { rel, base } = exchangeStore;
        if (base && rel) {
            if (config[rel] ? config[rel].estimateFee : config[base].estimateFee) {
                this.setState({ advanceToggleDisabled: false });
            } else if (config[rel] ? config[rel].noFee : config[base].noFee) {
                this.setState({ showFees: false });
            } else {
                this.setState({ advanceToggleDisabled: true, showAdvanced: true });
            }
        }
    }
    render(){
        const { showFees, advanceToggleDisabled, showAdvanced } = this.state;
        const { exchangeStore, priceStore } = this.props.rootStore;
        const { rel, base } = exchangeStore;
        let fee_label = base ? `Network Fees (${config[base].fee_label})` : "";
        if(!base || !rel){ return (null)}
        return (
            <Div>
                {
                    showFees &&
                    <FaDiv vcenter>
                        <Fa fs></Fa>
                        <Fa className={cx(styles.feelabel)}>Advanced Options</Fa>
                        <Switch
                            disabled={advanceToggleDisabled}
                            checked={showAdvanced}
                            onChange={() => {
                                exchangeStore.estimateFee(exchangeStore.feeSlider);
                                this.setState({ showAdvanced: !showAdvanced })
                            }}
                            value="checkedA"
                            color="primary"
                        />
                    </FaDiv>
                }
                {
                    showAdvanced &&
                    rel == "ETH" &&
                    <FaDiv>
                        <TextField
                            className={cx(stylesg.mar_20_0)}
                            value={exchangeStore.gasLimit}
                            onChange={(e) => { exchangeStore.setFees(e.target.value, 1) }}
                            label={`Gas Limit (in gwei)`}
                            type="text"
                            fullWidth />

                        <TextField
                            className={cx(stylesg.mar_20)}
                            value={exchangeStore.gasPrice}
                            onChange={(e) => { exchangeStore.setFees(e.target.value, 2) }}
                            label={`Gas Price (in gwei)`}
                            type="text"
                            fullWidth />
                    </FaDiv>
                }
                {showFees && showAdvanced && rel != "ETH" &&
                    <TextField
                        className={cx(stylesg.mar_20_0)}
                        value={exchangeStore.fees}
                        onChange={(e) => { exchangeStore.setFees(e.target.value) }}
                        label={fee_label}
                        type="text"
                        fullWidth />
                }
                {
                    showFees && !showAdvanced &&
                    <FaDiv c>
                        <FaDiv vcenter>
                            <Fa className={cx(styles.feelabel)}>Slow</Fa>
                            <Slider value={exchangeStore.feeSlider} onChange={(event, value) => {
                                exchangeStore.setFeeSlider(value);
                                exchangeStore.estimateFee(value);
                            }} />
                            <Fa className={cx(styles.feelabel)}>Fast</Fa>
                        </FaDiv>
                        <FaDiv c>
                            <Fa tcenter>
                                ~{(exchangeStore.fees / getAtomicValue(rel, base)).toFixed(5)}
                                <span className={cx(styles.feelabel)}> ({priceStore.fiat.symbol}{(exchangeStore.fees / getAtomicValue(rel, base) * priceStore.getFiatPrice(rel)).toFixed(3)})
                </span>
                            </Fa>
                            <Fa tcenter className={cx(styles.feelabel)}>Max Time: {(exchangeStore.max_time / 60).toFixed(2)} minutes</Fa>
                        </FaDiv>
                    </FaDiv>
                }
       
            </Div>
        );
    }
}
export default FeeBox;