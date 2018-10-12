import { observable, action, runInAction } from 'mobx';
import { config, btc_forks ,web3, getConfig} from 'app/constants';
import axios from 'axios';
import OmniJs from "app/omnijs/omnijs";

export class ExchangeStore {
  @observable omni = new OmniJs();
  @observable balance = 0;
  @observable n_tx = 0;
  @observable txs = [];
  @observable base = "";
  @observable rel = "";
  @observable address = "";
  @observable publicKey = "";
  @observable fiat = {name: "USD", symbol: "$"};
  @observable fiat_price = 0;
  @observable seed = "";
  @observable passphrase = "";
  @observable mnemonic = "connect ritual news sand rapid scale behind swamp damp brief explain ankle";
  
  @observable feeSlider = 85;
  @observable estimatedFees = null;
  @observable max_time = 0;
  @observable pkey = "";
  @observable fees = 0;
  
  @observable gasLimit = 0;
  @observable gasPrice = 0;
  @observable isTestnet = true; //change to false in prod

  @observable sorter = {value: 0, dir: 1};
  @observable currency = [
    {base: "BTC", name: "Bitcoin", index: 1, rel: [
      {ticker: "BTC",index: 1, priceusd: 0, price: 0, last_price: 0, change: 0},
      {ticker: "DASH",index: 2, priceusd: 0, price: 0, last_price: 0, change: 0},
      {ticker: "LTC",index: 3, priceusd: 0, price: 0, last_price: 0, change: 0},
      {ticker: "VTC",index: 4, priceusd: 0, price: 0, last_price: 0, change: 0},
      {ticker: "BTG",index: 5, priceusd: 0, price: 0, last_price: 0, change: 0},
    ]},
    {base: "ETH", name: "Ethereum", index: 2, rel: [
      {ticker: "ETH",index: 1, priceusd: 0, price: 0, last_price: 0, change: 0},
    ]},
    {base: "NEO", name: "Ethereum", index: 3, rel: [
      {ticker: "NEO",index: 1, priceusd: 0, price: 0, last_price: 0, change: 0},
    ]},
  ];
  
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
    this.omni.set(this.rel, this.isTestnet, config);
  }
  @action 
  setFeeSlider = (value) => {
    this.feeSlider = value;
  }

  @action 
  generatePKey = () => {
    const seed = this.omni.generateSeed(this.mnemonic, this.passphrase)
    this.mnemonic = seed.mnemonic;
    this.seed = seed.seed;
    const k = this.omni.generatePKey(seed.seed)
    this.pkey = k.wif;
    this.address = k.address;
    this.publicKey = k.publicKey;
    
    //this.address = "AJAf8TbEc6zA3Vire3piNeG5dM3WAwzZY6";
    
    this.syncBalance();
    this.getFiatPrice();
    this.syncFee();
  }

  @action 
  syncBalance = async (timeout = true) => {
    //@ts-ignore
    let data, data2 = null;
    //@ts-ignore
    const { txs } = await this.omni.getTxs(this.address);
    const balance: any = await this.omni.getBalance(this.address);
    runInAction(() => {
      this.txs = txs;
      this.balance = balance;
    });
    if (timeout) {
      setTimeout(() => {
        this.syncBalance();
      },60000)
    }
  }

  @action
  getFiatPrice = async () => {
    const data =  await axios.get(`https://min-api.cryptocompare.com/data/price?fsym=${this.rel}&tsyms=${this.fiat.name}`);
    runInAction(() => {
      this.fiat_price = data.data[this.fiat.name];
    });
  }
  @action
  syncFee = async () => {
    let estimatedFees, data, fees = 0;
    switch (this.rel) {
      case 'BTC':
        data =  await axios.get(`https://bitcoinfees.earn.com/api/v1/fees/list`);
        estimatedFees = data.data.fees;      
      break;
      case (btc_forks.indexOf(this.rel)+1 && this.rel):
        const nstr = ""+Array.from({length: 25}, (_, n) => n+2);
        data = await axios.get(`${getConfig("api", this.rel, this.isTestnet)}/utils/estimatefee?nbBlocks=${nstr}`);        
        estimatedFees = data.data;
        fees = estimatedFees[3];
      break;
      case "ETH":
        data =  await axios.get(`https://ethgasstation.info/json/ethgasAPI.json`);
        estimatedFees = data.data;
      break;
      default:
      break;
    }
    runInAction(() => {
      this.estimatedFees = estimatedFees;
      this.estimateFee(this.feeSlider);
      this.fees = fees;
    });    
  }
  @action
  setFees = (fees, kind = 0) => {
    switch(this.rel){
      case "BTC":
      case (btc_forks.indexOf(this.rel)+1 && this.rel):     
      case "NEO":
        this.fees = fees;
      break;
      default:
        switch(kind){
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
    }
  }
  estimateFee = (percent) => {
    let max_time = 0,fees = 0, gasLimit = 0, gasPrice = 0;
    switch (this.rel) {
      case 'BTC':
        const bytes = 400; // 400 bytes approx
        let estimation = 50 - Math.round(percent/100*50);
        if(estimation < 1) estimation = 1;
        if(estimation > 49) estimation = 49;
        
        const feeBlock = this.estimatedFees[estimation];
        const sat_per_byte = feeBlock.maxFee;
        
        max_time = this.estimatedFees[4].maxMinutes/4*estimation * 60; // in seconds
        fees = sat_per_byte * bytes;
      break;
      case "ETH":
      //https://ethgasstation.info/json/ethgasAPI.json
      gasLimit = 21000;
      const atom = (this.estimatedFees.fastest - this.estimatedFees.safeLow)/100;
      let gasPrice = ((atom*percent)+this.estimatedFees.safeLow);
      fees = gasLimit * gasPrice * 1000000000;


      const atom2 = (this.estimatedFees.safeLowWait - this.estimatedFees.fastestWait)/100;
      max_time = (this.estimatedFees.safeLowWait - atom2*percent)*60;

      break;
      default:
      break;
    }    
    runInAction(() => {
      this.max_time = max_time;
      this.fees = fees;

      this.gasLimit = gasLimit;
      this.gasPrice = gasPrice;      
    });
  }
  send = async (address, amount, _data = "") => {
    switch(this.rel){
      case 'BTC':
      case 'NEO':
      case (btc_forks.indexOf(this.rel)+1 && this.rel):
        this.omni.send(
        this.address,
        address,
        amount,
        this.pkey,
        {
          publicKey: this.publicKey,
          fees: this.fees
        });
      break;
      case "ETH":
        this.omni.send(
          this.address,
          address,
          amount,
          this.pkey,
          {
            fees: this.fees,
            gasLimit: web3.utils.toHex(this.gasLimit.toString()),
            gasPrice: web3.utils.toHex(this.gasPrice.toString()),
          });
      break;
    }
  }
}

export default ExchangeStore;
