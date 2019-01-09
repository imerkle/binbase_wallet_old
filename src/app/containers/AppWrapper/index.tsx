import { inject, observer } from "mobx-react";
import * as React from "react";

// Avatar
import { Fab, Icon, List, ListItem, ListItemText, Snackbar, Tooltip } from "@material-ui/core";
import { Div, Fa, FaDiv, Link } from "app/components";

import {
  MAX_DECIMAL,
  MAX_DECIMAL_FIAT,
} from "app/constants";
import cx from "classnames";
import {toJS} from  "mobx";
import { Scrollbars } from "react-custom-scrollbars";
import * as stylesg from "../..//style.css";
import * as styles from "./style.css";
import BottomBar from './BottomBar';
import Settings from 'app/containers/Settings';

const arrows = ["Coin", "Price"];
@inject("rootStore")
@observer
class AppWrapper extends React.Component<any, any> {
  public render() {
    const { children } = this.props;
    const { appStore, exchangeStore, priceStore, coinStore, configStore } = this.props.rootStore;
    const { base, rel} = exchangeStore;
    const {config} = configStore;
    let coinlist = base ? ([base]).concat(toJS(config)[base].forks || [], Object.keys(config[base].assets || {})) : [];
    if(appStore.sort_type == 0 && appStore.sort_direction == 0){
      coinlist.sort((a,b)=>{if(a < b){ return -1 } if (a > b){return 1} return 0})
    }else if(appStore.sort_type == 0 && appStore.sort_direction == 1){
      coinlist.sort((b,a)=>{if(a < b){ return -1 } if (a > b){return 1} return 0})
    }else if(appStore.sort_type == 1 && appStore.sort_direction == 0){
      coinlist.sort((a,b)=>{
        const ap = priceStore.getFiatPrice(a) * (coinStore.balances[a] || {balance: 0}).balance;
        const bp = priceStore.getFiatPrice(b) * (coinStore.balances[b] || {balance: 0}).balance;
        if(bp < ap){ return -1 } if (a > b){return 1} return 0
      })
    }else if(appStore.sort_type == 1 && appStore.sort_direction == 1){
      coinlist.sort((b,a)=>{
        const ap = priceStore.getFiatPrice(a) * (coinStore.balances[a] || {balance: 0}).balance;
        const bp = priceStore.getFiatPrice(b) * (coinStore.balances[b] || {balance: 0}).balance;
        if(bp < ap){ return -1 } if (a > b){return 1} return 0
      })
    }
  	 return (
      <>
          <Snackbar message={appStore.snackmsg} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            open={appStore.snackopen}
            onClose={() => {appStore.snackOpen(false); }}
          />
         <div className={cx(styles.root, stylesg._100vh)}>

  					<FaDiv c={true} className={cx(styles.col1)}>
                <Link onClick={() => {
                  exchangeStore.setBase("");
                  exchangeStore.setRel("");
                }} clearfix={true} to="/">
                  <FaDiv className={cx(styles.fabdiv)}>
                      <Div className={cx(styles.nib, {[styles.selected]: !base})}></Div>
                      <Fab className={cx(styles.fab, {[styles.selected]: !base})} color="primary" ><Icon>home</Icon></Fab>
                  </FaDiv>
                </Link>

                {coinStore.isUnlocked && Object.keys(config).map((ox, i) => {
                  const o = config[ox];
                  if (!o.base) {
                    return (null);
                  }
                  return (
                      <Link key={i} onClick={() => {exchangeStore.setBase(ox); }} clearfix={true} to={`/coin/${ox}/`}>
                        <FaDiv className={cx(styles.fabdiv)}>
                            <Div className={cx(styles.nib, {[styles.selected]: ox == base })}></Div>
                            <Fab className={cx(styles.fab, {[styles.selected]: ox == base })} color="primary" >
                              <img className={cx(styles.fabicon)} src={`https://raw.githack.com/imerkle/cryptocurrency-icons/master/128/color/${ox.toLowerCase()}.png`} />
                            </Fab>
                        </FaDiv>
                      </Link>
                    );
                })}
  					</FaDiv>

            <FaDiv className={cx(styles.col2)}>
                {!base &&
                  <List style={{padding: 0, width: "100%"}} >
                    <Link clearfix={true} to="/">
                      <ListItem button={true}>
                        <ListItemText primary="Home" secondary="News, Changelog" />
                      </ListItem>
                    </Link>
                  </List>
                }
                {base && Object.keys(config).length > 0 &&
                  <FaDiv fs={true} c={true}>
                    <Div className={cx(styles.baseheader)}>
                      {config[base].name}
                    </Div>
                    <FaDiv>
                      {arrows.map((o, i) => {
                        return (
                          <FaDiv key={i} button={true} onClick={() => { appStore.toggleSort(i) }} fs={true} vcenter={true} className={cx(styles.sorter, {[styles.selected]: appStore.sort_type == i})}>
                              <Icon className={cx(styles.arrow)} style={{fontSize: "10px", paddingRight: "3px"}}>{appStore.sort_direction ? "arrow_upward" : "arrow_downward"}</Icon>
                              <Fa fs={true} tcenter={true}>{o}</Fa>
                          </FaDiv>
                          );
                      })}
                    </FaDiv>
                    <Scrollbars className={cx(styles.assets_menu_container)}>
                      { coinlist.map((ox, i) =>  {
                        const balance = coinStore.balances[ox] || {balance: 0};
                        const price_usd = priceStore.getFiatPrice(ox);
                        if (!(balance.balance > 0 || base == ox)) {
                          return (null);
                        }
                        let icon;
                        try {
                          icon = `https://raw.githack.com/imerkle/cryptocurrency-icons/master/32/color/${ox.toLowerCase()}.png`
                        } catch (e) {}
                        return (
                        <Link key={i} onClick={() => {exchangeStore.setRel(ox); }} clearfix={true} to={`/coin/${base}/${ox}`}>
                          <FaDiv className={cx(stylesg.pad_20, styles.li, {[styles.selected]: ox == rel})}>

                          <FaDiv vcenter={true} fs={true} style={{width: "18px"}}>
                                <Div className={cx(styles.col_icon)} style={{ backgroundImage: `url(${icon})` }} ></Div>
                          </FaDiv>
                          <Fa fs={true} style={{width: "100px"}}>
                            <FaDiv vcenter={true}>
                              <Div className={cx(styles.rel)}>{ox}</Div>
                            </FaDiv>
                          <FaDiv vcenter={true}>
                                  <Div className={cx(styles.vol)}>{priceStore.fiat.symbol}{+(
                                    price_usd * balance.balance).toFixed(MAX_DECIMAL_FIAT)}</Div>
                            </FaDiv>
                          </Fa>
                          <FaDiv fs={true} c={true} style={{width: "86px"}}>
                                <Div className={cx(styles.price)}>{+(balance.balance).toFixed(MAX_DECIMAL)}</Div>
                          </FaDiv>

                          </FaDiv>
                        </Link>
                      ); })}
                    </Scrollbars>
                  </FaDiv>
                }
  						</FaDiv>
            <BottomBar />
           <Scrollbars className={cx(styles.col3)}>
             <div style={{padding: "10px 30px"}}>{children}</div>
           </Scrollbars>
         </div>
        {appStore.settingsOpen && <Settings />}
      </>
  		);
  }
}
export default AppWrapper;
