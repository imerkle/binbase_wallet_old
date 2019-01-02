import { toJS } from "mobx";
import { inject, observer } from "mobx-react";
import * as React from "react";

import { Div, FaDiv, TextField } from "app/components";

import cx from "classnames";
import * as stylesg from "../../style.css";

@inject("rootStore")
@observer
class FeeBox extends React.Component<any, any> {

    public render() {
        const { exchangeStore, configStore } = this.props.rootStore;
        const { rel, base } = exchangeStore;
        const config = toJS(configStore.config);
        if (!base || !rel) { return (null); }

        const fee_label = config[base].fee_label;
        let showFees = true;
        let dualFees = false;

        if ((config[rel] && config[rel].hasOwnProperty("noFee")) || config[base].hasOwnProperty("noFee")) {
            showFees = false;
        }
        if ((config[rel] && config[rel].hasOwnProperty("dualFee")) || config[base].hasOwnProperty("dualFee")) {
            dualFees = true;
        }

        return (
            <Div>
                {
                    showFees && dualFees &&
                    <FaDiv>
                        <TextField
                            className={cx(stylesg.mar_20_0)}
                            value={exchangeStore.gasLimit}
                            onChange={(e) => { exchangeStore.setFees(e.target.value, 1); }}
                            label={`Gas Limit (in ${fee_label})`}
                            type="text"
                            fullWidth={true} />

                        <TextField
                            className={cx(stylesg.mar_20)}
                            value={exchangeStore.gasPrice}
                            onChange={(e) => { exchangeStore.setFees(e.target.value, 2); }}
                            label={`Gas Price (in ${fee_label})`}
                            type="text"
                            fullWidth={true} />
                    </FaDiv>
                }
                {showFees && !dualFees &&
                    <TextField
                        className={cx(stylesg.mar_20_0)}
                        value={exchangeStore.fees}
                        onChange={(e) => { exchangeStore.setFees(e.target.value); }}
                        label={`Network Fees (${fee_label})`}
                        type="text"
                        fullWidth={true} />
                }

            </Div>
        );
    }
}
export default FeeBox;
