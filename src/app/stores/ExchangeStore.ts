import { observable, action, runInAction } from 'mobx';
import hdkey from 'ethereumjs-wallet/hdkey';
import bip39 from 'bip39';
import bitcore from 'bitcore-lib';
import { web3, getAtomicValue, etherscan_api_key, apiEndPoints, apiInsight, testnet } from 'app/constants';
import axios from 'axios';
import bitcoin from 'bitcoinjs-lib';
import coininfo from 'coininfo';

const Tx = require('ethereumjs-tx')

function toFixed(x) {
  if (Math.abs(x) < 1.0) {
    var e = parseInt(x.toString().split('e-')[1]);
    if (e) {
        x *= Math.pow(10,e-1);
        x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
    }
  } else {
    var e = parseInt(x.toString().split('+')[1]);
    if (e > 20) {
        e -= 20;
        x /= Math.pow(10,e);
        x += (new Array(e+1)).join('0');
    }
  }
  return x;
}
var Insight = require('app/utils/insight');
const insight = new Insight();
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
      {ticker: "BTC",index: 1, priceusd: 0, price: 0, last_price: 0, change: 0},
      {ticker: "DASH",index: 2, priceusd: 0, price: 0, last_price: 0, change: 0},
      {ticker: "LTC",index: 3, priceusd: 0, price: 0, last_price: 0, change: 0},
      {ticker: "DOGE",index: 4, priceusd: 0, price: 0, last_price: 0, change: 0},
      {ticker: "VTC",index: 5, priceusd: 0, price: 0, last_price: 0, change: 0},
      {ticker: "BTG",index: 6, priceusd: 0, price: 0, last_price: 0, change: 0},
    ]},
    {base: "ETH", name: "Ethereum", index: 2, rel: [
      {ticker: "ETH",index: 1, priceusd: 0, price: 0, last_price: 0, change: 0},
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
    let hash;
    switch(this.rel){
      case 'BTC':
      case 'LTC':
      case 'DASH':
      case 'DOGE':
      case 'VTC':
      case 'BTG':
        hash = bitcoin.crypto.sha256(Buffer.from(this.seed))
        const keyPair = bitcoin.ECPair.fromPrivateKey(hash)

        const derivedWallet = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: coininfo(`${this.rel}${testnet.suffix}`).toBitcoinJS() });
        this.pkey= keyPair.toWIF();
        this.address = derivedWallet.address;
        //this.address = "1DEP8i3QJCsomS4BSMY2RpU1upv62aGvhD";
      break;
      //eth and rest of its shitcoins
      default:
        const wallet = hdkey.fromMasterSeed(this.seed);
        const w = wallet.getWallet();
        this.address = w.getAddressString();
        this.pkey = w.getPrivateKeyString().substr(2);
        //this.address = "0xddbd2b932c763ba5b1b7ae3b362eac3e8d40121a";
      break;
    }
    this.syncBalance();
    this.getFiatPrice();
    this.syncFee();
  }

  @action 
  syncBalance = async (timeout = true) => {
    //@ts-ignore
    let data, data2 = null;
    switch(this.rel){
      case 'BTC':
      case 'LTC':
      case 'DASH':
      case 'DOGE':
      case 'VTC':
      case 'BTG':
        data = await axios.get(`${apiInsight[this.rel]}/addr/${this.address}`);
        //@ts-ignore
        data2 = await axios.get(`${apiInsight[this.rel]}/txs/?address=${this.address}`);

        if (timeout) {
          setTimeout(() => {
            this.syncBalance();
          },60000)
        }

        runInAction(() => {
          this.balance = data.data.balance;
          this.n_tx = data.data.txAppearances;

          const txs = [];
          data2.data.txs.map(o=>{
            const from = o.vin[0].addr;
            let value = 0;
            let kind = "got";
            let fee = o.fees;

            if(from!= this.address){
              kind = "got";
              o.vout.map(o=>{ 
                if(o.scriptPubKey.addresses[0]  == this.address){
                  value += o.value;
                }
              })
            }else{
              kind = "sent";
              value = o.valueOut;
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
    let estimatedFees, data, fees = 0;
    switch (this.rel) {
      case 'BTC':
        data =  await axios.get(`https://bitcoinfees.earn.com/api/v1/fees/list`);
        estimatedFees = data.data.fees;      
      break;
      case 'LTC':
      case 'DASH':
      case 'DOGE':
      case 'VTC':
      case 'BTG':
        const nstr = ""+Array.from({length: 25}, (_, n) => n+2);
        data = await axios.get(`${apiInsight[this.rel]}/utils/estimatefee?nbBlocks=${nstr}`);        
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
      case 'LTC':
      case 'DASH':
      case 'DOGE':
      case 'VTC':
      case 'BTG':      
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

  send = (address, amount, _data = "") => {
    switch(this.rel){
      case 'BTC':
      case 'LTC':
      case 'DASH':
      case 'DOGE':
      case 'VTC':
      case 'BTG':
        const multiply_by = (this.rel  == "BTC") ? 1 : getAtomicValue(this.rel);
        insight.getUtxos(this.address, (err, utxos) => {
          var tx = bitcore.Transaction();
          tx.from(utxos);
          tx.to(address, amount*10**8);
          tx.change(this.address);
          tx.sign(this.pkey);
          tx.fee(this.fees*multiply_by);
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
                gasLimit: web3.utils.toHex(this.gasLimit.toString()),
                gasPrice: web3.utils.toHex(this.gasPrice.toString()), 
                to: address,
                from: this.address,
                //@ts-ignore
                value: web3.utils.toHex(toFixed(amount*10**18).toString())
            }           
            
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
