import { toJS } from "mobx";
import { inject, observer } from "mobx-react";
import * as React from "react";

import { CircularProgress, Icon, IconButton } from "@material-ui/core";
import { AButton, Div, Fa, FaDiv, TextField } from "app/components";

import { StyleRules, Theme, withStyles } from "@material-ui/core/styles";
import {
  getAtomicValue,
  getConfig,
  isValidAddress,
  MAX_DECIMAL,
  MAX_DECIMAL_FIAT,
  numberWithCommas,
  smartTrim,
 } from "app/constants";
import cx from "classnames";
import { compose } from "recompose";
import * as stylesg from "../../style.css";
import * as styles from "./style.css";

 // @ts-ignore
import formatDistance from "date-fns/formatDistance";
import FeeBox from "./FeeBox";

const styleSheet = (theme: Theme): StyleRules => ({
  root: {
    flexGrow: 1,
  },
  tabsRoot: {},
  tabsIndicator: {
    backgroundColor: "transparent",
  },
  tabRoot: {
    "textTransform": "initial",
    "minWidth": 72,
    "flex": "0 1 auto",
    "background": "#1D1D1D",
    "&:hover": {
      color: "#FFF",
      opacity: 1,
    },
    "&$tabSelected": {
      color: "#FFF",
      background: "rgb(38, 38, 38)",
    },
    "&:focus": {
      color: "#FFF",
    },
  },
  tabcontainer: {
    background: "rgb(38, 38, 38)",
  },
  tabSelected: {},
  icon: {
    color: "#a7a7a7",
  },
});

@compose(withStyles(styleSheet))
@inject("rootStore")
@observer
class Exchange extends React.Component<any, any> {

  public state = {
    addressField: "",
    amountField: "",
    addressError: false,
  };
  public componentWillReceiveProps() {
    this.init();
  }
  public componentDidMount() {
    this.init();
  }
  public init = () => {
    const { exchangeStore } = this.props.rootStore;
    const { base, rel } = this.props.match.params;

    exchangeStore.setBase(base);
    exchangeStore.setRel(rel);
    exchangeStore.init();
  }

  public render() {
    const { classes } = this.props;
    const { configStore, exchangeStore, coinStore, priceStore, appStore } = this.props.rootStore;
    const { address, txs: _txs } = exchangeStore;
    const { addressField, amountField, addressError } = this.state;
    const { rel, base } = exchangeStore;
    const config = toJS(configStore.config);
    if (!rel || !base || Object.keys(config).length == 0) {
      return (null);
    }
    const balance = coinStore.balances[rel] || {balance: 0, pending: 0};
    const balance_usd = priceStore.getFiatPrice(rel) * balance.balance;
    const { explorer } = getConfig(config, rel, base);
    const txs = toJS(_txs);
    console.log(base, rel, txs);
  	 return (
      <FaDiv c={true}>
        <FaDiv>
          <FaDiv fs={true} c={true}>
            <Fa className={cx(stylesg.uppercase)}>{rel} Balance</Fa>
            <FaDiv vcenter={true} className={cx(styles.balance)}>
              <Fa fa={true} className={cx(styles.balance)}>{+balance.balance.toFixed(MAX_DECIMAL_FIAT)}</Fa>
              <Fa fs={true} className={cx(styles.pending)}>{balance.pending > 0 ? `(${+balance.pending.toFixed(MAX_DECIMAL_FIAT)} pending)` : ""}</Fa>
            </FaDiv>
          </FaDiv>
          <FaDiv c={true}>
            <Fa className={cx(stylesg.uppercase)}>{priceStore.fiat.name} Value</Fa>
            <Fa className={cx(styles.balance)}>{priceStore.fiat.symbol}{numberWithCommas(+balance_usd.toFixed(MAX_DECIMAL_FIAT))}</Fa>
          </FaDiv>
        </FaDiv>
        <FaDiv vcenter={true}>
          <TextField
            className={cx(stylesg.mar_20_0)}
            value={address}
            disabled={true}
            label={`Your ${rel} Address`}
            type="text"
            fullWidth={true} />

            <TextField
            className={cx(stylesg.invisible)}
            value={address}
            id="address"
            type="text" />

          <IconButton onClick={() => {
              const textArea = document.getElementById("address");
              // @ts-ignore
              textArea.select();

              const range = document.createRange();
              range.selectNodeContents(textArea);
              window.getSelection().addRange(range);
              document.execCommand("copy");
              appStore.setSnackMsg("Address copied to clipboard");
          }}color="primary" ><Icon style={{fontSize: 14}} className={cx(classes.icon)}>file_copy</Icon></IconButton>
        </FaDiv>
        <FaDiv c={true} className={cx(stylesg.mar_20, styles.tx_box)}>
          <Div className={cx(styles.sorter, styles.selected)}>Send Transaction</Div>
          <FaDiv>
            <TextField
              error={!!addressError}
              className={cx(stylesg.mar_20_0)}
              value={addressField}
              onChange={(e) => {
                  let _addressError = false;
                  if (!isValidAddress(config, e.target.value, rel, base)) {
                    _addressError = true;
                  }
                  this.setState({addressField: e.target.value, addressError: _addressError });
              }}
              label={addressError ? `Invalid ${rel} address` : `Recieving Address`}
              type="text"
              fullWidth={true} />
            <FaDiv vcenter={true}>
              <TextField
                className={cx(stylesg.mar_20)}
                value={amountField}
                onChange={(e) => { this.setState({amountField: e.target.value }); }}
                label={`${rel} Amount to Send`}
                type="text"
                fullWidth={true} />
                <IconButton onClick={() => {
                this.setState({ amountField: balance.balance - (exchangeStore.fees / getAtomicValue(config, rel, base))});
                }} color="primary" ><Icon style={{fontSize: 14}} className={cx(classes.icon)}>call_made</Icon></IconButton>
            </FaDiv>
          </FaDiv>
          <FeeBox />
          <AButton
          className={cx(stylesg.mar_20_0, stylesg.pad_20)}
          variant="contained" color="primary" disabled={!!addressError}
          onClick={this.send}>Send</AButton>
        </FaDiv>
        {txs.length > 0 &&
          <table className={cx(styles.tx_box, stylesg.mar_20)}>
          <tbody>
            <tr>
            <th className={cx(styles.sorter, styles.selected)}>TxHash</th>
            <th className={cx(styles.sorter, styles.selected)} >Age</th>
            <th ></th>
            <th className={cx(styles.sorter, styles.selected)} >Value</th>
            <th className={cx(styles.sorter, styles.selected)} >TxFee</th>
            </tr>
          {txs.map((o, i) => {
            return (
            <tr key={i} className={cx(styles.tx_box_li, {[styles.tx_pending]: o.confirmations == 0})} onClick={() => {
                window.open(`${explorer}/tx/${o.hash}`, "_blank");
               }}>
                <td>{smartTrim(o.hash, 20)}</td>
                <td>{o.confirmations == 0 ? <CircularProgress size={18} color="primary" /> :
                  formatDistance(new Date(o.timestamp * 1000), new Date(), { addSuffix: true })}</td>
                <td className={cx(stylesg.tcenter)}><span className={cx({[styles.got]: o.kind == "got"},
                {[styles.sent]: o.kind == "sent"})}>{o.kind == "got" ? "IN" : "OUT"}</span></td>
                <td>{o.value ? +Number(o.value).toFixed(MAX_DECIMAL) : 0} {o.asset ? o.asset.ticker : rel}</td>
                <td>{o.fee}</td>
            </tr>
            );
          })}
            <tr><td><a href={`${explorer}/address/${exchangeStore.address}`}>View all Transactions</a></td></tr>
          </tbody>
         </table>
        }
      </FaDiv>
    );
  }
  public send = () => {
    const { configStore, coinStore, exchangeStore, appStore} = this.props.rootStore;
    const { rel, base } = exchangeStore;
    const { addressError, addressField, amountField } = this.state;
    const config = toJS(configStore.config);

    const balance = coinStore.balances[rel];
    return new Promise(async (resolve, reject) => {
        const amt = parseFloat(amountField);
        const fees = exchangeStore.fees / getAtomicValue(config, rel, base);

        if (addressError || !addressField) {
          appStore.setSnackMsg("Invalid Bitcoin Address");
          reject();
        }
        if (isNaN(amt)) {
          appStore.setSnackMsg("Invalid Amount");
          reject();
        }
        if (balance.balance < amt) {
          appStore.setSnackMsg("Not enough balance");
          reject();
        }
        if (balance.balance < fees + amt) {
          appStore.setSnackMsg("Not enough balance to cover network fees");
          reject();
        }
        appStore.setSnackMsg("Transaction is being broadcasted!");
        try {
          const {txid} = await exchangeStore.send(addressField, amt);
          appStore.setSnackMsg(`Transaction broadcast completed. tx: ${txid}`);
          this.setState({
            addressField: "",
            amountField: "",
          });
          resolve();
        } catch (e) {
          appStore.setSnackMsg("Transaction Failed to broadcast!");
          throw e;
          reject(e);
        }
        // exchangeStore.syncBalance(false)
      });
    }
}
export default Exchange;
