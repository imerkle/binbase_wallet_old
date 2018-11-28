import * as React from 'react';
import { observer, inject } from 'mobx-react';
import { toJS } from 'mobx';

import { FaDiv, Div, TextField } from 'app/components';

import * as stylesg from '../../style.css';
import cx from 'classnames';

@inject('rootStore')
@observer
class FeeBox extends React.Component<any, any>{

    render(){
        const { exchangeStore, configStore } = this.props.rootStore;
        const { rel, base } = exchangeStore;
        const config = toJS(configStore.config);
        if(!base || !rel){ return (null)}
        
        const fee_label = config[base].fee_label;
        let showFees = true;
        let dualFees = false;

        if ((config[rel] && config[rel].hasOwnProperty("noFee")) || config[base].hasOwnProperty("noFee")){
            showFees = false
        }
        if ((config[rel] && config[rel].hasOwnProperty("dualFee")) || config[base].hasOwnProperty("dualFee") ) {
            dualFees = true
        }
                
        return (
            <Div>
                {
                    showFees && dualFees &&
                    <FaDiv>
                        <TextField
                            className={cx(stylesg.mar_20_0)}
                            value={exchangeStore.gasLimit}
                            onChange={(e) => { exchangeStore.setFees(e.target.value, 1) }}
                            label={`Gas Limit (in ${fee_label})`}
                            type="text"
                            fullWidth />

                        <TextField
                            className={cx(stylesg.mar_20)}
                            value={exchangeStore.gasPrice}
                            onChange={(e) => { exchangeStore.setFees(e.target.value, 2) }}
                            label={`Gas Price (in ${fee_label})`}
                            type="text"
                            fullWidth />
                    </FaDiv>
                }
                {showFees && !dualFees &&
                    <TextField
                        className={cx(stylesg.mar_20_0)}
                        value={exchangeStore.fees}
                        onChange={(e) => { exchangeStore.setFees(e.target.value) }}
                        label={`Network Fees (${fee_label})`}
                        type="text"
                        fullWidth />
                }
       
            </Div>
        );
    }
}
export default FeeBox;