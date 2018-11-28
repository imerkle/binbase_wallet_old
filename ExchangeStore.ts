import { observable, action, runInAction, toJS } from 'mobx';
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
  
  @observable wif = "";
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
  init = () => {
    
    const config = toJS(this.configStore.config)
    if (Object.keys(config).length > 0){
      let r = this.rel;
      if (config[this.base].hasOwnProperty("assets")){
        r = this.base;
      }
      
      const k = this.coinStore.keys[r];
      this.wif = k.wif;
      this.address = k.address;
      this.publicKey = k.publicKey;
      
      //this.syncBalance();
      //this.syncFee();
      this.syncTxs();
    }
  }

  @action 
  syncTxs = async (timeout = true) => {
    const config = toJS(this.configStore.config)

    //@ts-ignore
    const { txs } = await this.omni.getTxs(this.address, config);
    runInAction(() => {
      this.txs = txs;
    });    
  }

  send = (address, amount, _data = "") => {
    let result;
    const config = toJS(this.configStore.config)

    return new Promise(async(resolve, reject) => {
      try{
        if (config[this.base].dualFee){
            result = await this.omni.send(
              this.address,
              address,
              amount,
              this.wif,
              {
                fees: this.fees,
                gasLimit: Web3Utils.toHex(this.gasLimit.toString()),
                gasPrice: Web3Utils.toHex(this.gasPrice.toString()),
                config: config
              });
          }else {
            result = await this.omni.send(
              this.address,
              address,
              amount,
              this.wif,
              {
                publicKey: this.publicKey,
                fees: this.fees,
                config: config
              });
          }
          resolve(result)
      }catch(e){reject(e)}
   });
  }





  @action
  setFees = (fees, kind = 0) => {
    const config = toJS(this.configStore.config)

    if (config[this.base].dualFee) {
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
