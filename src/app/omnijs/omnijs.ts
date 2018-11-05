import bip39 from 'bip39'
import { getRootNode, deriveAccount, getWallet } from './keys'
import { broadcastTx, getUtxos } from './insight'
const Tx = require('ethereumjs-tx')
import axios from 'axios';
import BigNumber from 'bignumber.js'
import * as nanocurrency  from 'nanocurrency';
import {
  btc_forks,
  neo_assets,
  web3,
  getAtomicValue,
  etherscan_api_key,
  getConfig,
  nano_rep,
} from 'app/constants'



/**
 * @module OmniJs
 */

class OmniJs {
  public rel: string
  public  isTestnet: boolean
  public config: any

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
    const seed = bip39.mnemonicToSeed(mnemonic, passphrase).slice(0,32)
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
            case neo_assets.indexOf(this.rel) + 1 && this.rel:
            
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
            case 'NEO':
            case neo_assets.indexOf(this.rel) + 1 && this.rel:
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
    let balances = {};
    let balance: number = 0;
    return new Promise(async (resolve, reject) => {
      try {
        switch (this.rel) {
          case 'BTC':
          case (btc_forks.indexOf(this.rel) + 1 && this.rel):
            data = await axios.get(`${api}/addr/${address}`);
            balance = data.data.balance;
            balances = { [this.rel]: {balance} }
            break;
            case 'ETH':
            data = await axios.get(`${api}/?module=account&action=balance&address=${address}&tag=latest&apikey=${etherscan_api_key}`);
            balances = { [this.rel]: { balance: data.data.result / this.config[this.rel].decimals} }
          break;
          case 'NEO':
          case neo_assets.indexOf(this.rel) + 1 && this.rel:
            data = await axios.get(`${api}/get_balance/${address}`);
            data.data.balance.map(o=>{
              balances[o.asset] = { balance: o.amount };
            });
          break;
          case 'NANO':
            data = await axios.post(`${api}`,{
              "action": "account_balance",
              "account": address,     
            });
            //@ts-ignore
            balance = nanocurrency.convert(data.data.balance, {from: 'raw', to: 'NANO'});
            //@ts-ignore
            const pending = nanocurrency.convert(data.data.pending, { from: 'raw', to: 'NANO' });
            balances = { [this.rel]: { balance, pending } }
          break;
        }
        resolve(balances); 
  }catch(e){
    reject(e);
  }  });
}
pendingSyncNano = async({balance, pending, address, option}) => {
  //@ts-ignore
  balance = nanocurrency.convert(balance, { from: 'NANO', to: 'raw' });
  //@ts-ignore
  pending = nanocurrency.convert(pending, { from: 'NANO', to: 'raw' });

  const api = getConfig("api", this.rel, this.isTestnet);
  if (parseFloat(pending) > 0) {
    const d1 = await axios.post(`${api}`, {
      "action": "accounts_pending",
      "accounts": [address],
      "source": "true",
    });
    const d4 = await axios.post(`${api}`, {
      "action": "account_representative",
      "account": address,
    });

    const d3 = await axios.post(`${api}`, {
      "action": "accounts_frontiers",
      "accounts": [address],
    });

    const representative = d4.data.representative || nano_rep;
    const frontier = d3.data.frontiers[address];


    for (let x1 in d1.data.blocks[address]) {
      const o = d1.data.blocks[address][x1];
      const previous = frontier || "0000000000000000000000000000000000000000000000000000000000000000";
      const link = x1;
      const w1 = await axios.post(`${api}`, {
        "action": "work_generate",
        "hash": frontier || option.publicKey
      });
      const bal = new BigNumber(balance).plus(o.amount);
      console.log(balance,o.amount)
      console.log(bal)
      const unsigned_block = {
        link,
        previous,
        work: w1.data.work,
        balance: bal.c.join(""),
        representative,
      };
      //@ts-ignore
      const { hash, block } = nanocurrency.createBlock(option.pkey, unsigned_block);
      //@ts-ignore
      const r1 = await axios.post(`${api}`, {
        "action": "process",
        block: JSON.stringify(block),
      });
    }
  }  
}
}

export default OmniJs
