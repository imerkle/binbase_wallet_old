import * as React from 'react';
import { observer, inject } from 'mobx-react';

import { Link, Fa, Button, FaDiv, Div } from 'app/components';
//Avatar
import { Snackbar, List, ListItem, ListItemText, IconButton, Icon } from '@material-ui/core';

import * as styles from './style.css';
import * as stylesg from '../..//style.css';
import * as cx from 'classnames';
import { compose } from 'recompose';
import { StyleRules, Theme, withStyles } from '@material-ui/core/styles';

const styleSheet = (theme: Theme): StyleRules => ({
  icon: {
    color: "#a7a7a7"
  },
});

const sortByNameAsc = (a,b) => {
  if (a.ticker < b.ticker)
    return -1;
  if (a.ticker > b.ticker)
    return 1;
  return 0;
}
const sortByNameDesc = (a,b) => {
  if (b.ticker < a.ticker)
    return -1;
  if (b.ticker > a.ticker)
    return 1;
  return 0;
}

const sortByPriceAsc = (a,b) => { return a.price - b.price }
const sortByPriceDesc = (a,b) => { return b.price - a.price }

const sortByChangeAsc = (a,b) => { return a.change - b.change }
const sortByChangeDesc = (a,b) => { return b.change - a.change }



const arrows = ["Coin","Price"];
@compose(withStyles(styleSheet))
@inject('appStore','langStore','exchangeStore')
@observer
class AppWrapper extends React.Component<any, any>{

  state = {
    selected: 0,
  	select2: 0,
    market: "",
    slideLeft: false,
  } 		
  componentDidMount(){
    const { exchangeStore } = this.props;
    const { currency } = exchangeStore;
    const regex = /^\/markets\/(\w{3,5})/;
    const regex2 = /^\/exchange\/(\w{5,12})/;
    const str = window.location.pathname;
    let m;
    if ((m = regex.exec(str)) !== null) {
      this.setState({ selected: currency.filter(o => o.base == m[1].toUpperCase())[0].index });
    }else if((m = regex2.exec(str)) !== null){
      const _base = m[1].split("_")[0].toUpperCase();
      const _rel = m[1].split("_")[1].toUpperCase();
      const index = currency.filter(o => o.base == _base)[0].index;
      
      this.setState({ 
          selected: index,
          select2: currency[index-1].rel.filter(o => o.ticker == _rel)[0].index,
      });
    }

  }
  render(){
  	const { classes, appStore, children, exchangeStore } = this.props;
    const { select2, selected, slideLeft} = this.state;
  	const { sorter, currency } = exchangeStore;

    let rel = [];
    let c_currency;
    if(selected > 0){
      c_currency = currency[selected-1];

      switch(sorter.value){
        case 0:
          if(sorter.dir){
            rel = c_currency.rel.sort(sortByNameAsc);
          }else{
            rel = c_currency.rel.sort(sortByNameDesc);
          }
        break;
        case 1:
          if(sorter.dir){
            rel = c_currency.rel.sort(sortByPriceAsc);
          }else{
            rel = c_currency.rel.sort(sortByPriceDesc);
          }
        break;
        case 2:
          if(sorter.dir){
            rel = c_currency.rel.sort(sortByChangeAsc);
          }else{
            rel = c_currency.rel.sort(sortByChangeDesc);
          }
        break;
      }
    }
  	return (
  			<FaDiv fs className={cx(styles.root)}>
        <Snackbar message={appStore.snackmsg} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={appStore.snackopen}
          onClose={()=>{appStore.snackOpen(false)}}
         />

	  		{
  				<FaDiv fa className={cx(stylesg._100vh)}>

  					<FaDiv c className={cx(styles.left_bar, {[styles.slideLeft]: slideLeft})}>

            <Link onClick={()=>{ this.setState({ selected: 0 }) }} clearfix to="/">
              <FaDiv className={cx(styles.fabdiv)}>
                  <Div className={cx(styles.nib, {[styles.selected]: selected == 0})}></Div>
                  <Button className={cx(styles.fab, {[styles.selected]: selected == 0})} variant="fab" color="primary" ><Icon>home</Icon></Button>
              </FaDiv>
            </Link>

                {currency.map( (o, i) => {
                  return (
                      <Link key={i} onClick={()=>{ this.setState({ selected: o.index }) }} clearfix to={`/markets/${o.base}/`}>
                        <FaDiv className={cx(styles.fabdiv)}>
                            <Div className={cx(styles.nib, {[styles.selected]: selected == o.index})}></Div>
                            <Button className={cx(styles.fab, {[styles.selected]: selected == o.index})} variant="fab" color="primary" >{o.base.substr(0,1)}</Button>
                        </FaDiv>
                      </Link>
                    )
                })}

  					</FaDiv>

  					<FaDiv c className={cx(styles.mid_bar)}>
  						<FaDiv className={cx(styles.top_bar)}>
							
              {selected == 0 &&
                <List component="nav" >
                  <Link clearfix to="/history">
                    <ListItem button>
                      <ListItemText primary="Transaction History" secondary="Show Withdraw and Deposit History" />
                    </ListItem>
                  </Link>
                </List>
              }
              {selected != 0 &&
               
               <FaDiv fs c> 
                <Div className={cx(styles.baseheader)}> 
                   {c_currency.name}
                </Div>
                <FaDiv>
                  {arrows.map( (o, i) =>{
                    return (
                      <FaDiv key={i} button onClick={()=>{ exchangeStore.toggleSort(i) }} fs vcenter className={cx(styles.sorter,{[styles.selected]: sorter.value == i})}><Icon className={cx(styles.arrow)} style={{fontSize: "10px", paddingRight: "3px"}}>{sorter.dir ? "arrow_upward" : "arrow_downward"}</Icon><Fa fs tcenter>{o}</Fa></FaDiv>
                      )
                  })}
                </FaDiv>
                {rel.map( (o, i) =>  (
                  <Link key={i} onClick={()=>{ this.setState({ select2: i+1 }) }} ey={i} clearfix to={`/exchange/${c_currency.base}_${o.ticker}`}>
                    <FaDiv className={cx(stylesg.pad_20,styles.li,{[styles.selected]: select2 == i+1})}>

                    <Fa fs style={{width: "100px"}}>
                      <FaDiv vcenter>
                        <Div className={cx(styles.rel)}>{o.ticker}</Div>
                      </FaDiv>
                     <FaDiv vcenter>
                            <Div className={cx(styles.vol)}>{exchangeStore.fiat.symbol}{o.priceusd * (exchangeStore.balances[o.ticker] || 0)}</Div>
                      </FaDiv>                      
                    </Fa>
                    <FaDiv fs c style={{width: "86px"}}>
                        <Div className={cx(styles.price)}>{exchangeStore.balances[o.ticker] || 0}</Div>
                    </FaDiv>
                      
                    </FaDiv>
                  </Link>                   
                ))}
                </FaDiv>
              }

  						</FaDiv>
  						<FaDiv vcenter className={cx(styles.bottom_bar)}>
                <Fa fa onClick={()=>{ this.setState({slideLeft: !slideLeft}) }}>
                  <IconButton color="primary" ><Icon style={{fontSize: 14}} className={cx(classes.icon)}>arrow_back_io</Icon></IconButton>
                </Fa>
  						</FaDiv>
            </FaDiv>
            <FaDiv c className={cx(styles.slide_bar, {[styles.visible]: slideLeft})} onClick={()=>{ this.setState({slideLeft: !slideLeft}) }}>
              <IconButton color="primary" ><Icon style={{fontSize: 14}} className={cx(classes.icon)}>arrow_forward</Icon></IconButton>
  					</FaDiv>

	  			</FaDiv>
	  		}
        <Fa fs className={cx(stylesg.mar_20, styles.scrollable)}>
	  		  {children}
        </Fa>
  			</FaDiv>
  		)
  }
}
export default AppWrapper;