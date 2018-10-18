import bip39 from 'bip39'
import { getRootNode, deriveAccount, getWallet } from './keys'
import { broadcastTx, getUtxos } from './insight'
const Tx = require('ethereumjs-tx')
import axios from 'axios';

import {
  btc_forks,
  web3,
  getAtomicValue,
  etherscan_api_key,
  getConfig
} from 'app/constants'



/**
 * @module OmniJs
 */

class OmniJs {
  public rel: string
  public  isTestnet: boolean
  public config: any
  write

  constructor(rel?: string, isTestnet?: boolean, config?: any) {
    this.rel = rel || ''
    this.isTestnet = isTestnet || false
    this.config = config
  }
  set = (rel: string, isTestnet: boolean, config: any) => {
    this.rel = rel || ''
    this.isTestnet = isTestnet || false
    this.config = config
  }

  /**
   * Create a Seed.
   *
   * @param mnemonic - bip39 compatible mnemonic words
   * @param passohrase - passphrase for mnemonic
   * @returns Seed
   */
  generateSeed = (_mnemonic?: string, passphrase: string = '') => {
    const mnemonic = _mnemonic ? _mnemonic : bip39.generateMnemonic()
    const seed = bip39.mnemonicToSeed(mnemonic, passphrase)
    return { mnemonic, seed }
  }
  generatePKey = (
    seed: Buffer,
    account: number = 0,
    change: number = 1,
    index: number = 0
  ) => {
    const rootNode = getRootNode(seed, this.rel, this.isTestnet)
    const key = deriveAccount(rootNode, account, change, index, this.config, this.rel, this.isTestnet)
    const { wif, address, publicKey } = getWallet(key, this.rel, this.isTestnet)
    return { wif, address, publicKey }
  }
  send = (
    from: string,
    address: string,
    amount: number,
    wif: string,
    options?: any
  ) => {
    return new Promise(async (resolve, reject) => {
      switch (this.rel) {
      case 'BTC':
        case btc_forks.indexOf(this.rel) + 1 && this.rel:
          const multiply_by = this.rel == 'BTC' ? 1 : getAtomicValue(this.rel)
          const utxos = await getUtxos({ isTestnet: this.isTestnet, rel: this.rel, address: from })
          try {
            const txid = await broadcastTx({
              utxos,
              from: from,
              to: address,
              amount: amount * getAtomicValue(this.rel),
              wif: wif,
              fee: options.fees * multiply_by,
              isTestnet: this.isTestnet,
              rel: this.rel
            })
            resolve(txid)
          } catch (e) {
            reject(e)
          }
          break
        case 'ETH':
          web3.eth
            .getTransactionCount(from)
            .then(txCount => {
              const txData = {
                nonce: web3.utils.toHex(txCount.toString()),
                gasLimit: web3.utils.toHex(options.gasLimit.toString()),
                gasPrice: web3.utils.toHex(options.gasPrice.toString()),
                to: address,
                from: from,
                //@ts-ignore
                value: web3.utils.toHex(toFixed(amount * 10 ** 18).toString())
              }

              this.sendSignedWeb3(wif, txData, (err, result) => {
                if (err) reject(err)
                resolve(result)
              })
            })
            .catch(e => {
              reject(e)
            })
        case "NEO":

          const api = getConfig("api", this.rel, this.isTestnet);

          const balance = (await axios.get(`${api}/get_balance/${address}`)).data;
          const ne = require("./neo")
          try{
            const result = await ne.sendTransaction([{ amount, address, symbol: this.rel }],
             { balances: balance,
               wif,
               address: from,
               publicKey: options.publicKey,
               fees: options.fees,
               isTestnet: this.isTestnet,
              });
              resolve(result.txid);
          }catch(e){ reject(e); }
         break
      }
    })
  }

  sendSignedWeb3 = (wif: string, txData: any, cb: any) => {
    const privateKey = new Buffer(wif, 'hex')
    const transaction = new Tx(txData)
    transaction.sign(privateKey)
    const serializedTx = transaction.serialize().toString('hex')
    web3.eth.sendSignedTransaction('0x' + serializedTx, cb)
  }
  getTxs = (address: string) => {
    let data, n_tx, txs = [];
    const api = getConfig("api", this.rel, this.isTestnet);
    
    return new Promise(async (resolve, reject) => {
        try{
            switch(this.rel){
              case 'BTC':
              case (btc_forks.indexOf(this.rel)+1 && this.rel):
                data = await axios.get(`${api}/txs/?address=${address}`);
                n_tx = data.data.txAppearances;
                data.data.txs.map(o=>{
                  const from = o.vin[0].addr;
                  let value = 0;
                  let kind = "got";
                  let fee = o.fees;
      
                  if(from!= address){
                    kind = "got";
                    o.vout.map(o=>{ 
                      if(o.scriptPubKey.addresses[0]  == address){
                        value += o.value;
                      }
                    })
                  }else{
                    kind = "sent";
                    value = o.vout[0].value;
      
                  }
                  const tx = {
                    from,
                    hash: o.txid,
                    confirmations: o.confirmations,
                    value,
                    kind,
                    fee,
                    timestamp: o.blocktime,
                  };
                  txs.push(tx);
                })
            break;                  
            case 'NEOT':
                data = await axios.get(`${api}/get_address_abstracts/${address}/0`);

                n_tx = data.data.total_entries;
                data.data.entries.map(o=>{
                const from = o.address_from;
                const value = o.amount;
                let kind = "got";
                let fee = 0;
        
                if(from!= address){
                    kind = "got";
                }else{
                    kind = "sent";
                }
                const tx = {
                    from,
                    hash: o.txid,
                    confirmations: null,
                    value,
                    kind,
                    fee,
                    timestamp: o.time,
                    token_address: o.asset,
                  asset: this.config[this.rel].assets.main[o.asset] ? this.config[this.rel].assets.main[o.asset] : null,
                };
                txs.push(tx);
                })
            break;
            case 'ETH':
                data = await axios.get(`${api}/?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${etherscan_api_key}`);
    
              n_tx = data.data.result.length;
    
              data.data.result.map(o=>{
                const from = o.from;
                const value = o.value/getAtomicValue(this.rel);
                let kind = "got";
                let fee = (o.gas*o.gasPrice)/getAtomicValue(this.rel);
    
                if(from!= address){
                  kind = "got";
                }else{
                  kind = "sent";
                }
                const tx = {
                  from,
                  hash: o.hash,
                  confirmations: o.confirmations,
                  value,
                  kind,
                  fee,
                  timestamp: o.timeStamp,
                };
                txs.push(tx);
              })
          break;            
        }
            resolve({txs, n_tx});
        }catch(e){ reject(e)}
    });
}
  getBalance = (address: string) => {
    const api = getConfig("api", this.rel, this.isTestnet);
    let data;
    let balance: number = 0;
    return new Promise(async (resolve, reject) => {
      try {
        switch (this.rel) {
          case 'BTC':
          case (btc_forks.indexOf(this.rel) + 1 && this.rel):
            data = await axios.get(`${api}/addr/${address}`);
            balance = data.data.balance;
          break;
          case 'ETH':
          data = await axios.get(`${api}/?module=account&action=balance&address=${address}&tag=latest&apikey=${etherscan_api_key}`);
          balance = data.data.result / this.config[this.rel].decimals;
          break;
          case 'NEO':
            data = await axios.get(`${api}/get_balance/${address}`);
            data.data.balance.map(o=>{
              if(o.asset == this.rel){
                balance = o.amount;
              }
            })
          break;
        }
        resolve(balance); 
  }catch(e){
    reject(e);
  }  });
}
}

export default OmniJs
