import { inject, observer } from "mobx-react";
import * as React from "react";

// Avatar
import { Fab, Icon, IconButton, List, ListItem, ListItemText, Snackbar } from "@material-ui/core";
import { Button, Div, Fa, FaDiv, Link } from "app/components";

import { StyleRules, Theme, withStyles } from "@material-ui/core/styles";
import {
  MAX_DECIMAL,
  MAX_DECIMAL_FIAT,
} from "app/constants";
import cx from "classnames";
import {toJS} from  "mobx";
import { Scrollbars } from "react-custom-scrollbars";
import { compose } from "recompose";
import * as stylesg from "../..//style.css";
import * as styles from "./style.css";

const styleSheet = (theme: Theme): StyleRules => ({
  icon: {
    color: "#a7a7a7",
  },
});

const arrows = ["Coin", "Price"];
@compose(withStyles(styleSheet))
@inject("rootStore")
@observer
class AppWrapper extends React.Component<any, any> {

  public state = {
    slideLeft: false,
  };
  public render() {
    const { classes, children} = this.props;
    const { appStore, exchangeStore, priceStore, coinStore, configStore } = this.props.rootStore;
    const { slideLeft } = this.state;
    const { base, rel} = exchangeStore;
    const {config} = configStore;
    const sorter = {value: 1, dir: 1};
  	 return (
  			<FaDiv fs={true} className={cx(styles.root)}>
          <Snackbar message={appStore.snackmsg} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            open={appStore.snackopen}
            onClose={() => {appStore.snackOpen(false); }}
          />

	  		{
  				<FaDiv fa={true} className={cx(stylesg._100vh)}>

  					<FaDiv c={true} className={cx(styles.left_bar, {[styles.slideLeft]: slideLeft})}>

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
                              <img className={cx(styles.fabicon)} src={require(`cc-icons/color/${ox.toLowerCase()}.svg`)} />
                            </Fab>
                        </FaDiv>
                      </Link>
                    );
                })}

  					</FaDiv>

  					<FaDiv c={true} className={cx(styles.mid_bar)}>
  						<FaDiv className={cx(styles.top_bar)}>

              {!base &&
                <List component="nav" >
                  <Link clearfix={true} to="/">
                    <ListItem button={true}>
                      <ListItemText primary="Home" secondary="Generate, Restore or Export Wallet" />
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
                      <FaDiv key={i} button={true} onClick={() => { exchangeStore.toggleSort(i); }} fs={true} vcenter={true} className={cx(styles.sorter, {[styles.selected]: sorter.value == i})}><Icon className={cx(styles.arrow)} style={{fontSize: "10px", paddingRight: "3px"}}>{sorter.dir ? "arrow_upward" : "arrow_downward"}</Icon><Fa fs={true} tcenter={true}>{o}</Fa></FaDiv>
                      );
                  })}
                </FaDiv>
                <Scrollbars className={cx(styles.assets_menu_container)}>
                  { ([base]).concat(toJS(config)[base].forks || [], Object.keys(config[base].assets || {})).map((ox, i) =>  {
                    const balance = coinStore.balances[ox] || {balance: 0};
                    const price_usd = priceStore.getFiatPrice(ox);
                    if (!(balance.balance > 0 || base == ox)) {
                      return (null);
                    }
                    let icon;
                    try {
                      icon = require(`cc-icons/color/${ox.toLowerCase()}.svg`);
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
  						<FaDiv vcenter={true} className={cx(styles.bottom_bar)}>
                <Fa fa={true} onClick={() => { this.setState({slideLeft: !slideLeft}); }}>
                  <IconButton color="primary" ><Icon style={{fontSize: 14}} className={cx(classes.icon)}>arrow_back_io</Icon></IconButton>
                </Fa>
  						</FaDiv>
            </FaDiv>
            <FaDiv c={true} className={cx(styles.slide_bar, {[styles.visible]: slideLeft})} onClick={() => { this.setState({slideLeft: !slideLeft}); }}>
              <IconButton color="primary" ><Icon style={{fontSize: 14}} className={cx(classes.icon)}>arrow_forward</Icon></IconButton>
  					</FaDiv>

	  			</FaDiv>}
        <Fa fs={true} className={cx(stylesg.mar_20, styles.scrollable)}>
	  		  {children}
        </Fa>
  			</FaDiv>
  		);
  }
}
export default AppWrapper;
