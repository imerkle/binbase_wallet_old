import WAValidator from 'wallet-address-validator';
import Web3 from 'web3';

export const config = require('./config.js').default;

var options = {
    timeout: 20000, // milliseconds,
    headers: [{name: 'Access-Control-Allow-Origin', value: '*'}]
};
//@ts-ignore
export const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/2294f3b338ad4524aa9186012810e412", options));

export const etherscan_api_key = "8FISWFNZET4P2J451BY5I5GERA5MZG34S2";
//?module=account&action=txlist&address=0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae&startblock=0&endblock=99999999&sort=asc&apikey=YourApiKeyToken

export const getAtomicValue = (rel) => {
  return config[rel] ? config[rel].decimals : 10**18;
}
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

//to disable testnet make all null 
export const testnet = {
  suffix: "-TEST",
  //networkType: "prod",
  networkType: "testnet"
}

export const isValidAddress = (address, coin) => {
  switch(coin){
    case 'BTC':
    case 'DASH':
    case 'LTC':
      if(WAValidator.validate(address, coin,testnet.networkType)){
        return true;
      }
    break;
    case "NEO":
      return true;
      if(WAValidator.validate(address, 'neo', 'testnet')){
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

export const apiEndPoints = {
  "BTC": "https://api.blockcypher.com/v1/btc/main",
  "ETH": "https://api.etherscan.io/api",
}

export const btc_forks = ['LTC', 'DASH', 'VTC', 'BTG'];
export const no_advanced_fee = ["LTC", "DASH", "VTC", "BTG", "NEO"];
export const no_fee = ["NANO"];

export const toConfig = (isTestnet: boolean) => {
  return isTestnet ? "test" : "main";
}
export const getConfig = (key: string, rel: string, isTestnet: boolean) => {
  return config[rel][key][toConfig(isTestnet)]
}

export const neopriv_config = {
  name: 'PrivateNet',
  extra: {
    neoscan: 'http://0.0.0.0:4000/api/main_net'
  }
}