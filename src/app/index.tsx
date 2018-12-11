import * as React from 'react';
import { hot } from 'react-hot-loader';
import { withRouter, Router, Route, Switch } from 'react-router';
import { MuiThemeProvider, createMuiTheme, withStyles, createGenerateClassName, jssPreset } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

import { observer } from 'mobx-react';
//import { darkColors } from 'app/constants';
import Error from 'app/containers/Error';
// render react DOM
import { Provider } from 'mobx-react';
import { compose } from "recompose";

import { createBrowserHistory } from 'history';
import { createStores } from 'app/stores';

//@ts-ignore
import asyncComponent from 'app/utils/asyncComponent';


import AppWrapper from 'app/containers/AppWrapper';
//@ts-ignore
//const Login = asyncComponent(() => import('app/containers/Login').then(module => module.default), { name: 'Login' });
import { create } from "jss";
import JssProvider from "react-jss/lib/JssProvider";
import cx from 'classnames';
import { ErrorStore } from './stores/ErrorStore';
import * as styles from './style.css';

import Exchange from 'app/containers/Exchange';
import CoinFake from 'app/containers/CoinFake';
import Home from 'app/containers/Home';

const styleNode = document.createComment("insertion-point-jss");
document.head.insertBefore(styleNode, document.head.firstChild);

const generateClassName = createGenerateClassName();
const jss = create(jssPreset());
//@ts-ignore
jss.options.insertionPoint = "insertion-point-jss";


const history = createBrowserHistory();
const rootStore = createStores(history);

export const App = hot(module)(() => (
	<JssProvider jss={jss} generateClassName={generateClassName}>
    	<Router history={history}>
  			<AppFragment />
  		</Router>
  	</JssProvider>
));



const styleSheet = theme => ({
  overlay: {},
  dark_visible: {
    '& $overlay': {
      animation: '.15s growDarkOverlay',
      transition: '.25s transform',
    },
  },
  dark_invisible: {
    '& $overlay': {
      transition: '.25s transform',
    },
  },
  app_container: {
    '&$dark_invisible': {
      '& $overlay': {
        transform: 'scale(0)',
      }
    },
    '&$dark_visible': {
      '& $overlay': {
        transform: 'scale(1)',
        background: 'rgba(0,0,0,.3)',
      }
    },
  },
});

//@ts-ignore
@withRouter
@compose(withStyles(styleSheet))
@observer
class AppFragment extends React.Component<any, any>{
	public theme;
	public errorStore;
	constructor(props){
		super(props)
		this.theme = createMuiTheme({
		      	palette: {
		        	type: (rootStore.appStore.theme == 0) ? 'dark' : 'light',
				    primary: {
				        light: "#d3d9ee",
				        main: "#6b80c5",
				        dark: "#3c50a3",
				        contrastText: "#fff",
				    }
		      	},
				typography: {
				  useNextVariants: true,
				},
	      });
		const {classes} = props;
		this.errorStore = new ErrorStore({ 
      		visibleClass: classes.dark_visible,
      		inVisibleClass: classes.dark_invisible,
      		rootClass: classes.app_container,			
		});
		this.initiate();
	}
	initiate = async () => {
		await rootStore.configStore.setConfig();
		rootStore.priceStore.syncFiatPrices();
	}
	render(){
		const {classes} = this.props;
		return (
		  <MuiThemeProvider theme={this.theme} >
		  	<CssBaseline />
				<Provider {...this.props} rootStore={rootStore} errorStore={this.errorStore} >
		  	<div
		  	   className={cx(
		  	   	styles.app_container,
                classes.app_container,
                {DARK_THEME: rootStore.appStore.theme === 0},
                {LIGHT_THEME: rootStore.appStore.theme === 1},
              )}
		  	>
			  	<Error overlayClassName={classes.overlay} />
		  		<AppWrapper>
			      <Switch>
						<Route path="/" exact component={Home} />
						<Route path="/coin/:base/:rel" component={Exchange} />
						<Route path="/coin/:base" component={CoinFake} />
			      </Switch>
		  		</AppWrapper>
			</div>
			</Provider>
		  </MuiThemeProvider>
		)		
	}
}