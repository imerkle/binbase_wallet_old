import bip39 from 'bip39'
import { getRootNode, deriveAccount, getWallet } from './keys'
import { getBalance as getBalanceBtc , send as sendBTC, getTxs as getBtcTx } from './insight'
import { sendETH, sendERC20, getEthTxs, getBalance as getBalanceEth } from './eth'
import { getBalance as getBalanceVet, getVetTxs } from './vet'
import { getBalance as getBalanceXrp, send as sendXRP, getTxs as getXrpTxs } from './xrp'
import { getBalance as getBalanceNano } from './nano'
import { getBalance as getBalanceNeo ,send as sendNeo, getTxs as getNeoTx } from './neo'

import {
  getAtomicValue,
  getConfig,
  config,
} from 'app/constants'



/**
 * @module OmniJs
 */

class OmniJs {
  public rel: string
  public base: string

  constructor(rel?: string, base?: string) {
    this.rel = rel || ''
    this.base = base || ''
  }
  set = (rel: string, base: string) => {
    this.rel = rel || ''
    this.base = base || ''
  }


  generateSeed = (_mnemonic?: string, passphrase: string = '', options?: any) => {
    const mnemonic = _mnemonic ? _mnemonic : bip39.generateMnemonic()
    //const seed = bip39.mnemonicToSeed(mnemonic, passphrase).slice(0,32)
    const seed = bip39.mnemonicToSeed(mnemonic, passphrase)
    
    const { wif, address, publicKey } = this.generatePKey(seed);

    return { wif, address, publicKey, mnemonic }
  }
  /*
  https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#Change
  */
  generatePKey = (
    seed: Buffer,
    account: number = 0,
    change: number = 0,
    index: number = 0
  ) => {
    const { rel, base } = this;
    const rootNode = getRootNode(seed, rel, base)
    const key = deriveAccount(rootNode, account, change, index, config, rel)
    const { wif, address, publicKey } = getWallet(key, rel, base)
    
    return { wif, address, publicKey }
  }

  send = (
    from: string,
    address: string,
    amount: number,
    wif: string,
    options?: any
  ) => {
    const { rel, base } = this;
    return new Promise(async (resolve, reject) => {
      let txid;
      try{
        switch (base) {
          case 'BTC':
            txid = await sendBTC({ from, rel, address, amount, wif, options});
          case 'ETH':
            //options.gasLimit *= 1000000000;
            options.gasPrice *= 1000000000;
            if (rel == base) {
              txid = await sendETH({ from, rel, address, amount, wif, options });
            } else {
              txid = await sendERC20({ from, rel, base, address, amount, wif, options });
            }
            break;
          case "NEO":
            txid = await sendNeo({ from, rel, base, address, amount, wif, options });
            break
          case "XRP":
            txid = await sendXRP({ from, rel, base, address, amount, wif, options });
          break
        }
        resolve({txid})
      }catch(e){reject(e)}
    })
  }
  getTxs = (address: string) => {
    const { rel, base } = this;

    let data, n_tx, txs = [];
    const api = getConfig(rel, base).api;
    let decimals = getAtomicValue(rel, base);

    return new Promise(async (resolve, reject) => {
        try{
          switch(base){
            case 'BTC':
              txs = await getBtcTx({rel, base, address});
            break;                  
            case 'NEO':
              txs = await getNeoTx({rel, base, address});
            break;
            case 'XRP':
              txs = await getXrpTxs({rel, base, address});
            break;
            case 'VET':
              txs = await getVetTxs({rel, base, address});
            break;
            case 'ETH':
              txs = await getEthTxs({rel, base, address});
            break;            
          }
          resolve({txs, n_tx});
        }catch(e){ reject(e)}
    });
}
  getBalance = (address: string) => {
    const { rel, base } = this;

    const api = getConfig(rel, base).api;
    let data;
    let balances = {};
    let balance: number = 0;
    return new Promise(async (resolve, reject) => {
      try {
        switch (base) {
          case 'BTC':
            balances = getBalanceBtc({rel, address, base});
          break;
          case 'NEO':
            balances = getBalanceNeo({rel, address, base});
          break;
          case 'NANO':
          balances = getBalanceNano({rel, address, base});
          break;
          case 'XRP':
            balances = getBalanceXrp({rel, address, base});
          break;
          case 'VET':
            balances = getBalanceVet({rel, address, base});
          break;
          case 'ETH':
            balances = getBalanceEth({rel, address, base});
          break;          
        }
        resolve(balances); 
  }catch(e){
    reject(e);
  }  });
}
}

export default OmniJs
