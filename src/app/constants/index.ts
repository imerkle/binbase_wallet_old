import { Address } from 'bitcore-lib';
import Web3 from 'web3';

var options = {
    timeout: 20000, // milliseconds,
    headers: [{name: 'Access-Control-Allow-Origin', value: '*'}]
};
//@ts-ignore
export const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/2294f3b338ad4524aa9186012810e412", options));


export const apiEndPoints = {
  "BTC": "https://api.blockcypher.com/v1/btc/main",
  "ETH": "https://api.etherscan.io/api",
}
export const etherscan_api_key = "8FISWFNZET4P2J451BY5I5GERA5MZG34S2";
//?module=account&action=txlist&address=0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae&startblock=0&endblock=99999999&sort=asc&apikey=YourApiKeyToken
export const explorers = {
  "BTC": "https://blocktrail.com/BTC",
  "ETH": "https://etherscan.io",
}
export const atomicValue = {
  "BTC": 10**8,
  "ETH": 10**18,
}
export const getAtomicValue = (rel) => {
  return atomicValue[rel] || 10**18;
}
/*
export const darkColors = {
    50: '#edf0f8',
    100: '#d3d9ee',
    200: '#b5c0e2',
    300: '#97a6d6',
    400: '#8193ce',
    500: '#6b80c5',
    600: '#6378bf',
    700: '#586db8',
    800: '#4e63b0',
    900: '#3c50a3',
    A100: '#f3f5ff',
    A200: '#c0ccff',
    A400: '#8da2ff',
    A700: '#748dff',
   'contrastDefaultColor': 'dark',
}
*/
export const darkColors = {
    primary: {
        light: "#d3d9ee",
        main: "#6b80c5",
        dark: "#3c50a3",
        contrastText: "#fff",
    }
}


export const stringToColour = (str) =>  {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  var colour = '#';
  for (var i = 0; i < 3; i++) {
    var value = (hash >> (i * 8)) & 0xFF;
    colour += ('00' + value.toString(16)).substr(-2);
  }
  return colour;
}

export const pair_decimals = {
  "BTC" : {
    "ETH" : 2
  }
};

export const isValidAddress = (address, coin) => {
  switch(coin){
    case 'BTC':
      if (Address.isValid(address)){
        return true;
      }
    break;
    default:
    if(web3.utils.isAddress(address)){
      return true;
    }
    break;
  }
  return false;
}
