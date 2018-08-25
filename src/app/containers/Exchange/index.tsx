import * as React from 'react';
import { observer, inject } from 'mobx-react';

//@ts-ignore
import { TabContainer, Fa, FaDiv, Avatar, Div, Span, AButton, Link, TextField } from 'app/components';
import { Switch, IconButton, Icon } from '@material-ui/core';
import Slider from '@material-ui/lab/Slider';
//@ts-ignore
import * as styles from './style.css';
import * as stylesg from '../../style.css';
import * as cx from 'classnames';
import { compose } from 'recompose';
import { StyleRules, Theme, withStyles } from '@material-ui/core/styles';
import { getAtomicValue, explorers, isValidAddress } from 'app/constants';


var moment = require('moment');

//import SwipeableViews from 'react-swipeable-views';

//import Buy from './buy';
//import Sell from './sell';




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
/*
const maxWidths = {
  "BTC": 0.5,
  "ETH": 4,
  "USDT": 3000,
};
const normalizeWidth = (width) => {
  const max = 100;
  const min = 15;
  if(width > max){
    return max;
  }else if(width < min){
    return min + width;
  }
  return width;
}

const dim = (price) => {
  price = price.toFixed(decimals).toString();
  if(price.substr(-1) != "0"){ 
    return (
      <Span>
        <Span className={cx(styles.dim)}>{price.substr(0,price.length-2)}</Span>
        <Span>{price.substr(-2)}</Span>
      </Span>
   );
  }else{
    return price;
  }
}
*/
const numberWithCommas = (x) => {
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}
@compose(withStyles(styleSheet))
@inject('langStore','exchangeStore','appStore')
@observer
class Exchange extends React.Component<any, any>{
  componentDidMount(){
    const { exchangeStore } = this.props;
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
    showAdvanced: false,
  }
  render(){
    const { classes, exchangeStore, appStore } = this.props;
    const { address, txs } = exchangeStore;
    const { showAdvanced, addressField, amountField, addressError } = this.state;
  	return (
      <FaDiv c>
        <FaDiv>
          <FaDiv fs c>
            <Fa className={cx(stylesg.uppercase)}>{exchangeStore.rel} Balance</Fa>
            <Fa className={cx(styles.balance)}>{exchangeStore.balance}</Fa>
          </FaDiv>
          <FaDiv c>
            <Fa className={cx(stylesg.uppercase)}>{exchangeStore.fiat.name} Value</Fa>
            <Fa className={cx(styles.balance)}>{exchangeStore.fiat.symbol}{numberWithCommas(exchangeStore.fiat_price*exchangeStore.balance)}</Fa>
          </FaDiv>
        </FaDiv>      
        <FaDiv vcenter>
          <TextField
            className={cx(stylesg.mar_20_0)}
            value={address}
            disabled
            label={`Your ${exchangeStore.rel} Address`}
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
                  if(!isValidAddress(e.target.value, exchangeStore.rel)){
                    _addressError = true;
                  }
                  this.setState({addressField: e.target.value, addressError: _addressError })
              }}
              label={addressError ? `Invalid ${exchangeStore.rel} address` : `Recieving Address`}
              type="text"
              fullWidth />   
            <FaDiv vcenter>
              <TextField
                className={cx(stylesg.mar_20)}
                value={amountField}
                onChange={(e)=>{ this.setState({amountField: e.target.value }) }}
                label={`${exchangeStore.rel} Amount to Send`}
                type="text"
                fullWidth />             
                <IconButton onClick={()=>{
                  this.setState({amountField: exchangeStore.balance - (exchangeStore.fees/getAtomicValue(exchangeStore.rel)) })
                }} color="primary" ><Icon style={{fontSize: 14}} className={cx(classes.icon)}>call_made</Icon></IconButton>
            </FaDiv>
          </FaDiv>
          <FaDiv vcenter>
            <Fa fs></Fa>
            <Fa className={cx(styles.feelabel)}>Advanced Options</Fa>
            <Switch
              checked={showAdvanced}
              onChange={()=>{ 
                exchangeStore.estimateFee(exchangeStore.feeSlider);
                this.setState({showAdvanced: !showAdvanced})
              }}
              value="checkedA"
              color="primary"
            />          
          </FaDiv>
          {
            showAdvanced &&
            exchangeStore.rel == "ETH" &&  
          <FaDiv>
            <TextField
              className={cx(stylesg.mar_20_0)}
              value={exchangeStore.gasLimit}
              onChange={(e)=>{ exchangeStore.setFees(e.target.value, 1) }}
              label={`Gas Limit (in gwei)`}
              type="text"
              fullWidth />

            <TextField
              className={cx(stylesg.mar_20)}
              value={exchangeStore.gasPrice}
              onChange={(e)=>{ exchangeStore.setFees(e.target.value, 2) }}
              label={`Gas Price (in gwei)`}
              type="text"
              fullWidth />
          </FaDiv>
          }
          {
            showAdvanced &&
            exchangeStore.rel == "BTC" &&

           <TextField
            className={cx(stylesg.mar_20_0)}
            value={exchangeStore.fees}
            onChange={(e)=>{ exchangeStore.setFees(e.target.value) }}
            label={`Network Fees (in sats)`}
            type="text"
            fullWidth />
          }          
          {
          !showAdvanced &&
          <FaDiv c>
            <FaDiv vcenter>
              <Fa className={cx(styles.feelabel)}>Slow</Fa>
              <Slider value={exchangeStore.feeSlider} onChange={(event, value)=>{
                 exchangeStore.setFeeSlider(value);
                 exchangeStore.estimateFee(value);
              }} />
              <Fa className={cx(styles.feelabel)}>Fast</Fa>
            </FaDiv>
            <FaDiv c>
              <Fa tcenter>
                ~{(exchangeStore.fees/getAtomicValue(exchangeStore.rel)).toFixed(5)}
                <span className={cx(styles.feelabel)}> ({exchangeStore.fiat.symbol}{(exchangeStore.fees/getAtomicValue(exchangeStore.rel)*exchangeStore.fiat_price).toFixed(3)})
                </span>
              </Fa>
              <Fa tcenter className={cx(styles.feelabel)}>Max Time: {(exchangeStore.max_time/60).toFixed(2)} minutes</Fa>
            </FaDiv>
          </FaDiv>
          }

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
            <tr key={i} className={cx(styles.tx_box_li)} onClick={()=>{
                  window.open(`${explorers[exchangeStore.rel]}/tx/${o.hash}`,"_blank");
               }}>
                <td>{o.hash}</td>
                <td>{moment.unix(o.timestamp).fromNow()}</td>
                <td className={cx(stylesg.tcenter)}><span className={cx({[styles.got]: o.kind == "got"},
                {[styles.sent]: o.kind == "sent"})}>{o.kind == "got" ? "IN": "OUT" }</span></td>
                <td>{o.value} {exchangeStore.rel}</td>
                <td>{o.fee}</td>
            </tr>
            )
          })}
          <tr><td><a href={`${explorers[exchangeStore.rel]}/address/${exchangeStore.address}`}>View all Transactions</a></td></tr>
          </tbody>
         </table>
        }
      </FaDiv>
    )
  }
  send = () => {
    const {exchangeStore, appStore} = this.props;
    const { addressError, addressField, amountField } = this.state;
      return new Promise((resolve, reject) => {
        const amt = parseFloat(amountField);
        let fees = exchangeStore.fees/getAtomicValue(exchangeStore.rel);
          
        if(addressError || !addressField){
          appStore.setSnackMsg("Invalid Bitcoin Address");
          return false;
        }
        if(isNaN(amt)){
          appStore.setSnackMsg("Invalid Amount");
          return false;
        }
        if(exchangeStore.balance < amt){
          appStore.setSnackMsg("Not enough balance");
          return false;
        }
        if(exchangeStore.balance < fees + amt){
          appStore.setSnackMsg("Not enough balance to cover network fees");
          return false;
        }
        exchangeStore.send(addressField, amt )
      });    
    }
}
export default Exchange;