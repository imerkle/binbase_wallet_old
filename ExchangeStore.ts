import { observable, action, runInAction } from 'mobx';
import OmniJs from "app/omnijs"
import { CoinStore } from './CoinStore';
import { ConfigStore } from '../ConfigStore';
import Web3Utils from 'web3-utils';


export class ExchangeStore {
  
  @observable base = "";
  @observable rel = "";

  @observable address = "";
  @observable publicKey = "";
  @observable seed = "";
  
  @observable pkey = "";
  @observable fees = 0;
  
  @observable gasLimit = 0;
  @observable gasPrice = 0;

  @observable txs = [];


  public coinStore;
  public configStore;
  public omni = new OmniJs();

  constructor(coinStore: CoinStore, configStore: ConfigStore){
      this.coinStore = coinStore;
      this.configStore = configStore;
  }

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
    if (this.configStore.config[this.base].hasOwnProperty("assets")){
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
        if (this.configStore.config[this.base].dualFee){
            result = await this.omni.send(
              this.address,
              address,
              amount,
              this.pkey,
              {
                fees: this.fees,
                gasLimit: Web3Utils.toHex(this.gasLimit.toString()),
                gasPrice: Web3Utils.toHex(this.gasPrice.toString()),
                config: this.configStore.config
              });
          }else {
            result = await this.omni.send(
              this.address,
              address,
              amount,
              this.pkey,
              {
                publicKey: this.publicKey,
                fees: this.fees,
                config: this.configStore.config
              });
          }
          resolve(result)
      }catch(e){reject(e)}
   });
  }





  @action
  setFees = (fees, kind = 0) => {
    if (this.configStore.config[this.base].dualFee) {
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
    } else {
      this.fees = fees;
    }
  }
}

export default ExchangeStore;
