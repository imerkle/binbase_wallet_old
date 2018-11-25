import WAValidator from 'wallet-address-validator';
import web3Utils from 'web3-utils';
//export const config = require('./config').default;
export const config = require('./test_config').default;

export const etherscan_api_key = "8FISWFNZET4P2J451BY5I5GERA5MZG34S2";
export const ethplorer_api_key = "freekey";

export const darkColors = {
    primary: {
        light: "#d3d9ee",
        main: "#6b80c5",
        dark: "#3c50a3",
        contrastText: "#fff",
    }
}

export const btc_forks = config["BTC"]["forks"];
export const neo_assets = Object.keys(config["NEO"].assets);
export const eth_assets = Object.keys(config["ETH"].assets);

export const allcoins = Object.keys(config);
export const isTestnet = true;

export const transferABI = [{ constant: !1, inputs: [{ name: "_to", type: "address" }, { name: "_value", type: "uint256" }], name: "transfer", outputs: [{ name: "", type: "bool" }], type: "function" }];

export const getAtomicValue = (rel, base) => {
    return config[rel] ? config[rel].decimals : 10 ** config[base].assets[rel].decimals;
}
export const getConfig = (rel: string, base: string) => {
    return config[rel] ? config[rel] : Object.assign({
        explorer: config[base].explorer,
        api: config[base].api,
        rpc: config[base].rpc,
    }, config[base].assets[rel]);
}

export const isValidAddress = (address, coin) => {
    let networkType = `prod`;
    if (config[coin].code == 1) {
        networkType = `testnet`;
    }
    switch (coin) {
        case 'BTC':
        case 'DASH':
        case 'LTC':
            if (WAValidator.validate(address, coin, networkType)) {
                return true;
            }
            break;
        case "NEO":
            return true;
            if (WAValidator.validate(address, 'neo', networkType)) {
                return true;
            }
            break;
        case "NANO":
            //const nanocurrency = require("nanocurrency");
            //return nanocurrency.checkAddress(address);
            if (WAValidator.validate(address, 'nano', networkType)) {
                return true;
            }
        case "XRP":
            return true;
            break;
        default:
            if (web3Utils.isAddress(address)) {
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