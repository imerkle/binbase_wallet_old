import { btc_forks } from 'app/constants'
import coininfo from 'coininfo'
import bip32 from 'bip32'
import bitcoin from 'bitcoinjs-lib'
import bitcoinSecp256r1 from 'bitcoinjs-lib-secp256r1'
import { wallet as NeoWallet } from '@cityofzion/neon-core'
import ethUtil from 'ethereumjs-util'
import * as nanocurrency from 'nanocurrency';

export const getNetwork = (rel: string, isTestnet?: boolean) => {
  return coininfo(`${rel}${isTestnet ? '-TEST' : ''}`).toBitcoinJS()
}
export const getRootNode = (seed: any, rel: string, isTestnet?: boolean) => {
  let rootNode
  switch (rel) {
    case 'BTC':
    case btc_forks.indexOf(rel) + 1 && rel:
      const network = getNetwork(rel, isTestnet)
      rootNode = bip32.fromSeed(seed, network)

      break
    case 'NEO':
      rootNode = bitcoinSecp256r1.HDNode.fromSeedBuffer(
        seed,
        bitcoinSecp256r1.bitcoin
      )
      break
    case 'NANO':
      return seed.toString("hex");
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
  config: any,
  rel: string,
  isTestnet?: boolean,
) => {
  const networkCode = isTestnet ? 1 : config[rel].code
  const bip44path = `m/44'/${networkCode}'/${account}'/${change}/${index}`
  return typeof rootNode == "object" ? rootNode.derivePath(bip44path) : rootNode;
}
export const getWallet = (key: any, rel: string, isTestnet?: boolean) => {
  let wif, address, publicKey
  switch (rel) {
    case 'BTC':
    case btc_forks.indexOf(rel) + 1 && rel:
      const network = getNetwork(rel, isTestnet)    
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
      break      
    default:
      //eth and rest of its shitcoins
      var privKeyBuffer = key.keyPair.d.toBuffer(32)
      const privkey = privKeyBuffer.toString('hex')
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
