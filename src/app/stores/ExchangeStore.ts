import { observable, action, runInAction } from 'mobx';
import { eth_assets, neo_assets, config, btc_forks , getConfig} from 'app/constants';
import axios from 'axios';
import OmniJs from "app/omnijs/omnijs";
import { CoinStore } from './CoinStore';
import Web3Utils from 'web3-utils';

const coins = [];
let ig = 1;
for(let x in config){
  const c = config[x];
  if(c.base){
    const assets = c.assets ? Object.keys(c.assets): [];
    coins.push(
      {
        base: x, name: c.name, index: ig, rel: [
          { ticker: x, index: 1 },
          ...c.forks.map((o, i) => { return { ticker: o, index: i + 2 } }),
          ...assets.map((o, i) => { return { ticker: o, index: c.forks.length + 2 } }),
        ]
      }      

    )
    ig++;
  }
}
export class ExchangeStore {
  public omni = new OmniJs();

  @observable txs = [];
  @observable base = "";
  @observable rel = "";
  @observable address = "";
  @observable publicKey = "";
  @observable seed = "";
  
  @observable estimatedFees = null;
  @observable max_time = 0;
  @observable pkey = "";
  @observable fees = 0;
  
  @observable gasLimit = 0;
  @observable gasPrice = 0;

  @observable sorter = {value: 1, dir: 1};
  @observable currency = coins;


  public coinStore;
  constructor(coinStore: CoinStore){
      this.coinStore = coinStore;
  }


  @action
  toggleSort = (value) => {  
    if(value == this.sorter.value){
      this.sorter = {value, dir: +!this.sorter.dir};
    }else{
      this.sorter = {value, dir: this.sorter.dir};
    }
  };

  @action 
  setBase = (base) => {
    this.base = base;
  }
  @action 
  setRel = (rel) => {
    this.rel = rel;
    this.omni.set(this.rel, this.base);
  }

  @action 
  generatePKey = () => {
    
    let r = this.rel;
    if (config[this.base].hasOwnProperty("assets")){
      r = this.base;
    }
    
    const k = this.coinStore.keys[r];
    this.pkey = k.wif;
    this.address = k.address;
    this.publicKey = k.publicKey;
        
    //this.syncBalance();
    //this.syncFee();
    this.syncTxs();
  }

  @action 
  syncTxs = async (timeout = true) => {
    //@ts-ignore
    const { txs } = await this.omni.getTxs(this.address);
    runInAction(() => {
      this.txs = txs;
    });    
  }
  /*
  @action 
  syncBalance = async (timeout = true) => {
    //@ts-ignore
    let data, data2 = null;
    //@ts-ignore
    const { txs } = await this.omni.getTxs(this.address);
    //@ts-ignore
    const { balance, pending } = await this.omni.getBalance(this.address);
    if (this.rel == "NANO") {
      this.omni.pendingSyncNano({ balance, pending, address: this.address, option: { publicKey: this.publicKey, pkey: this.pkey } })
    }
    runInAction(() => {
      this.txs = txs;
      this.balance = balance;
      this.balances[this.rel] = balance;
      if (this.rel == "NANO"){
        this.pending = pending;
      }else{
      }
    });
    if (timeout) {
      setTimeout(() => {
        this.syncBalance();
      },60000)
    }
  }
  */

  send = (address, amount, _data = "") => {
    let result;
    return new Promise(async(resolve, reject) => {
      try{
          if(config[this.base].dualFee){
            result = await this.omni.send(
              this.address,
              address,
              amount,
              this.pkey,
              {
                fees: this.fees,
                gasLimit: Web3Utils.toHex(this.gasLimit.toString()),
                gasPrice: Web3Utils.toHex(this.gasPrice.toString()),
              });
          }else {
            result = await this.omni.send(
              this.address,
              address,
              amount,
              this.pkey,
              {
                publicKey: this.publicKey,
                fees: this.fees
              });
          }
          resolve(result)
      }catch(e){reject(e)}
   });
  }




  @action
  setFees = (fees, kind = 0) => {
    switch (this.rel) {
      case 'ETH':
      case (eth_assets.indexOf(this.rel) + 1 && this.rel):
        switch (kind) {
          case 1:
            this.gasLimit = parseInt(fees);
            this.fees = this.gasLimit * this.gasPrice * 1000000000;
            break;
          case 2:
            this.gasPrice = parseFloat(fees);
            this.fees = this.gasLimit * this.gasPrice * 1000000000;
            break;
        }
        break;
      default:
        this.fees = fees;
        break;
    }
  }
}

export default ExchangeStore;
