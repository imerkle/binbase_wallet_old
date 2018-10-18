import axios from 'axios'
import { getConfig, testnet } from 'app/constants'
import coininfo from 'coininfo'
import bitcoin from 'bitcoinjs-lib'

export const getUtxos = ({ rel, address, isTestnet }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await axios.post(`${getConfig("api",rel, isTestnet)}/addrs/utxo`, {
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
  isTestnet
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const network = coininfo(
        `${rel}${isTestnet ? testnet.suffix : ''}`
      ).toBitcoinJS()
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
      const data = await axios.post(`${getConfig("api", rel, isTestnet)}/tx/send`, {
        rawtx
      })
      resolve(data.data.txid)
    } catch (e) {
      reject(e)
    }
  })
}
