import * as React from 'react';
import { observer, inject } from 'mobx-react';

import { Fa, FaDiv, Div, AButton, TextField } from 'app/components';
import { CircularProgress, IconButton, Icon } from '@material-ui/core';

import * as styles from './style.css';
import * as stylesg from '../../style.css';
import cx from 'classnames';
import { compose } from 'recompose';
import { StyleRules, Theme, withStyles } from '@material-ui/core/styles';
import { btc_forks, getAtomicValue, getConfig, isValidAddress } from 'app/constants';

//@ts-ignore
import formatDistance from 'date-fns/formatDistance';
import FeeBox from './FeeBox';

const styleSheet = (theme: Theme): StyleRules => ({
  root: {
    flexGrow: 1,
  },
  tabsRoot: {},
  tabsIndicator: {
    backgroundColor: 'transparent',
  },
  tabRoot: {
    textTransform: 'initial',
    minWidth: 72,
    flex: '0 1 auto',
    background: '#1D1D1D',
    '&:hover': {
      color: '#FFF',
      opacity: 1,
    },
    '&$tabSelected': {
      color: '#FFF',
      background: 'rgb(38, 38, 38)',
    },
    '&:focus': {
      color: '#FFF',
    },
  },
  tabcontainer: {
    background: 'rgb(38, 38, 38)',
  },
  tabSelected: {},
  icon: {
    color: "#a7a7a7"
  },  
});

//@ts-ignore
const numberWithCommas = (x) => {
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}
const smartTrim = (string, maxLength) => {
    if (!string) return string;
    if (maxLength < 1) return string;
    if (string.length <= maxLength) return string;
    if (maxLength == 1) return string.substring(0,1) + '...';

    var midpoint = Math.ceil(string.length / 2);
    var toremove = string.length - maxLength;
    var lstrip = Math.ceil(toremove/2);
    var rstrip = toremove - lstrip;
    return string.substring(0, midpoint-lstrip) + '...' 
    + string.substring(midpoint+rstrip);
}   

@compose(withStyles(styleSheet))
@inject('rootStore')
@observer
class Exchange extends React.Component<any, any>{
  componentWillReceiveProps(){
    this.init()
  }
  componentDidMount(){
    this.init()
  }
  init = () => {
    const { exchangeStore } = this.props.rootStore;
    const regex2 = /^\/exchange\/(\w{5,12})/;
    const str = window.location.pathname;
    let m;

    if((m = regex2.exec(str)) !== null){
      const _base = m[1].split("_")[0].toUpperCase();
      const _rel = m[1].split("_")[1].toUpperCase();
      
      exchangeStore.setBase(_base);
      exchangeStore.setRel(_rel);
      exchangeStore.generatePKey();
    }
  }
  state = {
    addressField: "",
    amountField: "",
    addressError: false,
  }

  render(){
    const { classes } = this.props;
    const { exchangeStore, coinStore, priceStore, appStore } = this.props.rootStore;
    const { address, txs } = exchangeStore;
    const { addressField, amountField, addressError } = this.state;
    const { rel, base } = exchangeStore;
    if(!rel || !base){
      return (null)
    }

    const balance = coinStore.balances[rel] || {balance: 0, pending: 0};
    const balance_usd = priceStore.getFiatPrice(rel) * balance.balance;
    const { explorer } = getConfig(rel, base);

  	return (
      <FaDiv c>
        <FaDiv>
          <FaDiv fs c>
            <Fa className={cx(stylesg.uppercase)}>{rel} Balance</Fa>
            <FaDiv vcenter className={cx(styles.balance)}>
              <Fa fa className={cx(styles.balance)}>{balance.balance}</Fa>
              <Fa fs className={cx(styles.pending)}>{balance.pending > 0 ? `(${balance.pending} pending)` : ""}</Fa>
            </FaDiv>
          </FaDiv>
          <FaDiv c>
            <Fa className={cx(stylesg.uppercase)}>{priceStore.fiat.name} Value</Fa>
            <Fa className={cx(styles.balance)}>{priceStore.fiat.symbol}{numberWithCommas(balance_usd)}</Fa>
          </FaDiv>
        </FaDiv>      
        <FaDiv vcenter>
          <TextField
            className={cx(stylesg.mar_20_0)}
            value={address}
            disabled
            label={`Your ${rel} Address`}
            type="text"
            fullWidth />

            <TextField
            className={cx(stylesg.invisible)}
            value={address}
            id="address"
            type="text" />

          <IconButton onClick={()=>{
              var textArea = document.getElementById("address");
              //@ts-ignore
              textArea.select();

              var range = document.createRange();
              range.selectNodeContents(textArea);
              window.getSelection().addRange(range);          
              document.execCommand("copy");
              appStore.setSnackMsg("Address copied to clipboard");
          }}color="primary" ><Icon style={{fontSize: 14}} className={cx(classes.icon)}>file_copy</Icon></IconButton>
        </FaDiv>
        <FaDiv c className={cx(stylesg.mar_20,styles.tx_box)}>
          <Div className={cx(styles.sorter,styles.selected)}>Send Transaction</Div>
          <FaDiv>
            <TextField
              error={!!addressError}
              className={cx(stylesg.mar_20_0)}
              value={addressField}
              onChange={(e)=>{ 
                  let _addressError = false;
                  if(!isValidAddress(e.target.value, rel)){
                    _addressError = true;
                  }
                  this.setState({addressField: e.target.value, addressError: _addressError })
              }}
              label={addressError ? `Invalid ${rel} address` : `Recieving Address`}
              type="text"
              fullWidth />   
            <FaDiv vcenter>
              <TextField
                className={cx(stylesg.mar_20)}
                value={amountField}
                onChange={(e)=>{ this.setState({amountField: e.target.value }) }}
                label={`${rel} Amount to Send`}
                type="text"
                fullWidth />             
                <IconButton onClick={()=>{

                 const divide_by = (btc_forks.indexOf(rel) != -1) ? 1 : getAtomicValue(rel, base);
                 this.setState({amountField: balance.balance - (exchangeStore.fees/divide_by)})
              }} color="primary" ><Icon style={{fontSize: 14}} className={cx(classes.icon)}>call_made</Icon></IconButton>
            </FaDiv>
          </FaDiv>
          <FeeBox />
          <AButton 
          className={cx(stylesg.mar_20_0,stylesg.pad_20)}
          variant="contained" color="primary" disabled={!!addressError} 
          onClick={this.send}>Send</AButton>
        </FaDiv>
        {txs.length > 0 &&
          <table className={cx(styles.tx_box, stylesg.mar_20,)}>
          <tbody>
            <tr>
            <th className={cx(styles.sorter,styles.selected)}>TxHash</th>
            <th className={cx(styles.sorter,styles.selected)} >Age</th>
            <th ></th>
            <th className={cx(styles.sorter,styles.selected)} >Value</th>
            <th className={cx(styles.sorter,styles.selected)} >TxFee</th>
            </tr>
          {txs.map((o,i)=>{ 
            return (
            <tr key={i} className={cx(styles.tx_box_li, {[styles.tx_pending]: o.confirmations == 0})} onClick={()=>{
                window.open(`${explorer}/tx/${o.hash}`,"_blank");
               }}>
                <td>{smartTrim(o.hash, 20)}</td>
                <td>{o.confirmations == 0 ? <CircularProgress size={18} color="primary" /> : 
                  formatDistance(new Date(o.timestamp*1000), new Date(), { addSuffix: true })
                  //moment.unix(o.timestamp).fromNow()
                }</td>
                <td className={cx(stylesg.tcenter)}><span className={cx({[styles.got]: o.kind == "got"},
                {[styles.sent]: o.kind == "sent"})}>{o.kind == "got" ? "IN": "OUT" }</span></td>
                <td>{o.value} {o.asset ? o.asset.ticker : rel}</td>
                <td>{o.fee}</td>
            </tr>
            )
          })}
            <tr><td><a href={`${explorer}/address/${exchangeStore.address}`}>View all Transactions</a></td></tr>
          </tbody>
         </table>
        }
      </FaDiv>
    )
  }
  send = () => {
    const { coinStore, exchangeStore, appStore} = this.props.rootStore;
    const { rel, base } = exchangeStore;
    const { addressError, addressField, amountField } = this.state;
    const balance = coinStore.balances[rel];
      return new Promise(async (resolve, reject) => {
        const amt = parseFloat(amountField);
        const divide_by = (btc_forks.indexOf(rel) != -1) ? 1 : getAtomicValue(rel, base);
        let fees = exchangeStore.fees/divide_by;
          
        if(addressError || !addressField){
          appStore.setSnackMsg("Invalid Bitcoin Address");
          reject();
        }
        if(isNaN(amt)){
          appStore.setSnackMsg("Invalid Amount");
          reject();
        }
        if (balance.balance < amt){
          appStore.setSnackMsg("Not enough balance");
          reject();
        }
        if (balance.balance < fees + amt){
          appStore.setSnackMsg("Not enough balance to cover network fees");
          reject();
        }
        appStore.setSnackMsg("Transaction is being broadcasted!");
        try{
          const {txid} = await exchangeStore.send(addressField, amt)
          appStore.setSnackMsg(`Transaction broadcast completed. tx: ${txid}`);
          this.setState({
            addressField: "",
            amountField: "",
          });
          resolve();
        }catch(e){
          appStore.setSnackMsg("Transaction Failed to broadcast!");
          reject(e);
        }
        //exchangeStore.syncBalance(false)
      });    
    }
}
export default Exchange;