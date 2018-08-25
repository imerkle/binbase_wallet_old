import { observable, action, runInAction } from 'mobx';
import hdkey from 'ethereumjs-wallet/hdkey';
import bip39 from 'bip39';
import bitcore from 'bitcore-lib';
import { web3, getAtomicValue, etherscan_api_key, apiEndPoints } from 'app/constants';
import axios from 'axios';
const Tx = require('ethereumjs-tx')

var explorers = require('bitcore-explorers');
const insight = new explorers.Insight();
export class ExchangeStore {
  @observable balance = 0;
  @observable n_tx = 0;
  @observable txs = [];
  @observable base = "";
  @observable rel = "";
  @observable address = "";
  @observable fiat = {name: "USD", symbol: "$"};
  @observable fiat_price = 0;
  @observable seed = "connect ritual news sand rapid scale behind swamp damp brief explain ankle";
  
  @observable feeSlider = 85;
  @observable estimatedFees = null;
  @observable max_time = 0;
  @observable pkey = "";
  @observable fees = 0;
  
  @observable gasLimit = 0;
  @observable gasPrice = 0;


  @observable sorter = {value: 0, dir: 1};
  @observable currency = [
    {base: "BTC", name: "Bitcoin", index: 1, rel: [
      {ticker: "BTC",index: 1, vol: 4050, priceusd: 463.24, price: 0.00014, last_price: 0.0014, change: -2.3},
    ]},
    {base: "ETH", name: "Ethereum", index: 2, rel: [
      {ticker: "ETH",index: 1, vol: 4050, priceusd: 463.24, price: 0.00014, last_price: 0.0014, change: -2.3},
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
  generateSeed = () => {
    this.seed = bip39.generateMnemonic();
  }
  @action 
  setRel = (rel) => {
    this.rel = rel;
  }
  @action 
  setFeeSlider = (value) => {
    this.feeSlider = value;
  }

  @action 
  generatePKey = () => {
    if(!this.seed){
      this.generateSeed();
    }
    switch(this.rel){
      case 'BTC':
        const value = Buffer.from(this.seed);
        const hash = bitcore.crypto.Hash.sha256(value);
        const bn = bitcore.crypto.BN.fromBuffer(hash);
        this.pkey= new bitcore.PrivateKey(bn).toWIF();
        this.address = new bitcore.PrivateKey(bn).toAddress();
        //this.address = "1DEP8i3QJCsomS4BSMY2RpU1upv62aGvhD";s
      break;
      //eth and rest of its shitcoins
      default:
        const wallet = hdkey.fromMasterSeed(this.seed);
        const address = wallet.getWallet().getAddressString()
        this.address = address;
        this.address = "0xddbd2b932c763ba5b1b7ae3b362eac3e8d40121a";
      break;
    }
    this.syncBalance();
    this.getFiatPrice();
    this.syncFee();
  }

  @action 
  syncBalance = async () => {
    let data;
    switch(this.rel){
      case 'BTC':
        data =  await axios.get(`${apiEndPoints[this.rel]}/addrs/${this.address}/full?limit=20`);
        runInAction(() => {
          this.balance = data.data.balance/getAtomicValue(this.rel);
          this.n_tx = data.data.n_tx;

          const txs = [];
          data.data.txs.map(o=>{
            const from = o.inputs[0].addresses[0];
            let value = 0;
            let kind = "got";
            let fee = o.fees/getAtomicValue(this.rel);

            if(from!= this.address){
              kind = "got";
              o.outputs.map(o=>{ 
                if(o.addresses[0]  == this.address){
                  value += o.value/getAtomicValue(this.rel);
                }
              })
            }else{
              kind = "sent";
              value = o.total/getAtomicValue(this.rel);
            }
            const tx = {
              from: o.inputs[0].addresses[0],
              hash: o.hash,
              confirmations: o.confirmations,
              value,
              kind,
              fee,
              timestamp: new Date(o.received).getTime()/1000,
            };
            txs.push(tx);
          })
          this.txs = txs;
        });
      break;
      case 'ETH':
        data =  await axios.get(`${apiEndPoints[this.rel]}/?module=account&action=balance&address=${this.address}&tag=latest&apikey=${etherscan_api_key}`);
        const data2 =  await axios.get(`${apiEndPoints[this.rel]}/?module=account&action=txlist&address=${this.address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${etherscan_api_key}`);

        runInAction(() => {
          this.balance = data.data.result/getAtomicValue(this.rel);
          this.n_tx = data.data.result.length;

          const txs = [];
          data2.data.result.map(o=>{
            const from = o.from;
            const value = o.value/getAtomicValue(this.rel);
            let kind = "got";
            let fee = (o.gas*o.gasPrice)/getAtomicValue(this.rel);

            if(from!= this.address){
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
          this.txs = txs;
        });
      break;
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
    let estimatedFees, data;
    switch (this.rel) {
      case "BTC":
        data =  await axios.get(`https://bitcoinfees.earn.com/api/v1/fees/list`);
        estimatedFees = data.data.fees;
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
    });    
  }
  @action
  setFees = (fees, kind = 0) => {
    switch(this.rel){
      case "BTC":
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
      case "BTC":
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

  send = (address, amount, _data = "") => {

    switch(this.rel){
      case "BTC":
        insight.getUnspentUtxos(this.address, (err, utxos) => {
          var tx = bitcore.Transaction();
          tx.from(utxos);
          tx.to(address, amount*10**8);
          tx.change(this.address);
          tx.sign(this.pkey);
          tx.fee(this.fees);
          tx.serialize();

          insight.broadcast(tx, function(err, txId) {
              if (err) {
                  console.log('Error!:'+err);
              } else {
                  console.log('Successfully sent: '+txId);
              }
          });
        });
      break;
      case "ETH":
          web3.eth.getTransactionCount(this.address).then(txCount => {
            
              const txData = {
                nonce: web3.utils.toHex(txCount.toString()),
            }
            
            console.log(txCount)
            
            this.sendSignedWeb3(txData, (err, result) => {
              if (err) return console.log('error', err)
              console.log('sent', result)
            })
            
          }).catch(e=>{
            console.log(e)
          })
      break;
    }
  }
  sendSignedWeb3 = (txData, cb) => {
    const privateKey = new Buffer(this.pkey, 'hex')
    const transaction = new Tx(txData)
    transaction.sign(privateKey)
    const serializedTx = transaction.serialize().toString('hex')
    web3.eth.sendSignedTransaction('0x' + serializedTx, cb)
  }
}

export default ExchangeStore;
