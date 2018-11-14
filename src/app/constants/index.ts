import WAValidator from 'wallet-address-validator';
import Web3 from 'web3';

//export const config = require('./config.js').default;
export const config = require('./test_config.js').default;

var options = {
    timeout: 20000, // milliseconds,
    headers: [{name: 'Access-Control-Allow-Origin', value: '*'}]
};
//@ts-ignore
export const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/2294f3b338ad4524aa9186012810e412", options));

export const etherscan_api_key = "8FISWFNZET4P2J451BY5I5GERA5MZG34S2";
export const ethplorer_api_key = "freekey";
//?module=account&action=txlist&address=0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae&startblock=0&endblock=99999999&sort=asc&apikey=YourApiKeyToken

export const darkColors = {
    primary: {
        light: "#d3d9ee",
        main: "#6b80c5",
        dark: "#3c50a3",
        contrastText: "#fff",
    }
}

//to disable testnet make all null 
export const testnet = {
  suffix: "-TEST",
  //networkType: "prod",
  networkType: "testnet"
}

export const btc_forks = config["BTC"]["forks"];
export const neo_assets = Object.keys(config["NEO"].assets);
export const eth_assets = Object.keys(config["ETH"].assets);

export const neopriv_config = {
  name: 'PrivateNet',
  extra: {
    neoscan: `${config["NEO"].explorer}/api/main_net`
  }
}
export const nano_rep = "xrb_17krztbeyz1ubtkgqp9h1bewu1tz8sgnpoiii8q7c9n7gyf9jfmuxcydgufi";

export const allcoins = Object.keys(config);
export const isTestnet = true;

export const transferABI = [{ constant: !1, inputs: [{ name: "_to", type: "address" }, { name: "_value", type: "uint256" }], name: "transfer", outputs: [{ name: "", type: "bool" }], type: "function" }];


export const getAtomicValue = (rel, base) => {
  return config[rel] ? config[rel].decimals : 10**config[base].assets[rel].decimals;
}
export const getConfig = (rel: string, base: string) => {
  return config[rel] ? config[rel] : config[base].assets[rel];
}

export const stringToColour = (str) => {
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
export const isValidAddress = (address, coin) => {
  switch (coin) {
    case 'BTC':
    case 'DASH':
    case 'LTC':
      if (WAValidator.validate(address, coin, testnet.networkType)) {
        return true;
      }
      break;
    case "NEO":
      return true;
      if (WAValidator.validate(address, 'neo', 'testnet')) {
        return true;
      }
      break;
    case "NANO":
      const nanocurrency = require("nanocurrency");
      return nanocurrency.checkAddress(address);
      break;
    default:
      if (web3.utils.isAddress(address)) {
        return true;
      }
      break;
  }
  return false;
}


export const toBitcoinJS = (o) => {
  return Object.assign({}, o, {
    messagePrefix: null, // TODO
    bip32: {
      public: o.versions.bip32.public,
      private: o.versions.bip32.private
    },
    pubKeyHash: o.versions.public,
    scriptHash: o.versions.scripthash,
    wif: o.versions.private,
    dustThreshold: null // TODO
  })
}