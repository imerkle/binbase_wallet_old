import axios from 'axios'
import { getAtomicValue, toBitcoinJS, getConfig } from 'app/constants'
import bitcoin from 'bitcoinjs-lib'


export const getUtxos = ({ config, rel, address }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await axios.post(`${getConfig(config, rel, "BTC").api}/addrs/utxo`, {
        addrs: address
      })
      resolve(data.data)
    } catch (e) {
      reject(e)
    }
  })
}
export const broadcastTx = ({
  from,
  rel,
  utxos,
  to,
  amount,
  wif,
  fee,
  config
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const network = toBitcoinJS(config[rel].network)
      var key = bitcoin.ECPair.fromWIF(wif, network)
      var tx = new bitcoin.TransactionBuilder(network)
      let total = 0
      for (let utx of utxos) {
        tx.addInput(utx.txid, utx.vout)
        total += utx.satoshis
      }
      tx.addOutput(to, amount)
      const change = total - (amount + fee)
      if (change) tx.addOutput(from, change)

      utxos.forEach((v, i) => {
        tx.sign(i, key)
      })
      const rawtx = tx.build().toHex()
      const data = await axios.post(`${getConfig(config, rel, "BTC").api}/tx/send`, {
        rawtx
      })
      resolve(data.data.txid)
    } catch (e) {
      reject(e)
    }
  })
}

export const send = ({
  from, rel, address, amount, wif, options
}) => {
  const base = "BTC";
  return new Promise(async (resolve, reject) => {
    const multiply_by = rel == 'BTC' ? 1 : getAtomicValue(options.config, rel, base)
    const utxos = await getUtxos({ config: options.config, rel: rel, address: from })
    try {
      const txid = await broadcastTx({
        utxos,
        from: from,
        to: address,
        amount: amount * getAtomicValue(options.config, rel, base),
        wif: wif,
        fee: options.fees * multiply_by,
        rel: rel,
        config: options.config
      })
      resolve(txid)
    } catch (e) {
      reject(e)
    }
  });
}

export const getTxs = async ({config, address, rel, base}) => {
  const api = getConfig(config, rel, base).api;
  const txs = [];
  const data = await axios.get(`${api}/txs/?address=${address}`);
  data.data.txs.map(o => {
    const from = o.vin[0].addr;
    let value = 0;
    let kind = "got";
    let fee = o.fees;

    if (from != address) {
      kind = "got";
      o.vout.map(o => {
        if (o.scriptPubKey.addresses[0] == address) {
          value += o.value;
        }
      })
    } else {
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
  return txs;
}
export const getBalance = async ({config, rel, base, address}) => {
  const api = getConfig(config, rel, base).api;
  const data = await axios.get(`${api}/addr/${address}`);
  const balance = data.data.balance;
  return { [rel]: { balance } };
}