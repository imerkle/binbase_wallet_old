import { 
    getConfig,
    web3,
    getAtomicValue,
    config,
    transferABI,
    isTestnet,
    ethplorer_api_key,
    etherscan_api_key,
    eth_assets,

} from 'app/constants';
const Tx = require('ethereumjs-tx')
import axios from 'axios';
export const sendETH = ({
    from, rel, address, amount, wif, options
}) => {
    return new Promise(async (resolve, reject) => {
            web3.eth
            .getTransactionCount(from)
            .then(txCount => {
                const txData = {
                    nonce: web3.utils.toHex(txCount.toString()),
                    gasLimit: web3.utils.toHex(options.gasLimit.toString()),
                    gasPrice: web3.utils.toHex(options.gasPrice.toString()),
                    to: address,
                    from: from,
                    value: web3.utils.toHex(amount * getAtomicValue(rel, rel).toString())
                }
                sendSignedWeb3(wif, txData, (err, result) => {
                    if (err) reject(err)
                    resolve(result)
                })
            })
            .catch(e => {
                reject(e)
            })
    });
}

export const sendERC20 = ({
    base, from, rel, address, amount, wif, options
}) => {
    return new Promise(async (resolve, reject) => {
        const asset = config[base].assets[rel];

        let contract = new web3.eth.Contract(transferABI, asset.hash);
        const data = contract.methods.transfer(address, amount * (10 ** asset.decimals)).encodeABI();

        web3.eth
            .getTransactionCount(from)
            .then(txCount => {
                const txData = {
                    nonce: web3.utils.toHex(txCount.toString()),
                    gasLimit: web3.utils.toHex(options.gasLimit.toString()),
                    gasPrice: web3.utils.toHex(options.gasPrice.toString()),
                    to: asset.hash,
                    from: from,
                    data: data,
                    value: web3.utils.toHex(0)
                }

                this.sendSignedWeb3(wif, txData, (err, result) => {
                    if (err) reject(err)
                    resolve(result)
                })
            })
            .catch(e => {
                reject(e)
            })     
    });
}

export const sendSignedWeb3 = (wif: string, txData: any, cb: any) => {
    const privateKey = new Buffer(wif, 'hex')
    const transaction = new Tx(txData)
    transaction.sign(privateKey)
    const serializedTx = transaction.serialize().toString('hex')
    web3.eth.sendSignedTransaction('0x' + serializedTx, cb)
}


export const getEthTxs = async ({ address, rel, base }) => {
    const api = getConfig(rel, base).api;
    const txs = [];
    
    const data = await axios.get(`${api}/?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${etherscan_api_key}`);
    const decimals = getAtomicValue(rel, base);
    
    data.data.result.map(o => {
        const from = o.from;
        let fee = (o.gas * o.gasPrice) / decimals;
        
        const tx = {
            from,
            hash: o.hash,
            confirmations: o.confirmations,
            value: o.value / decimals,
            kind: from == address ? "sent" : "got",
            fee,
            timestamp: o.timeStamp,
        };
        txs.push(tx);
    })
    return txs;
}

export const getBalance = async ({ address, rel, base }) => {
    const api = getConfig(rel, base).api;
    let balances = {};

    if (isTestnet) {
        const data = await axios.get(`${api}/?module=account&action=balance&address=${address}&tag=latest&apikey=${etherscan_api_key}`);
        balances = { [rel]: { balance: data.data.result / config["ETH"].decimals } }
    } else {
        address = "0x32Be343B94f860124dC4fEe278FDCBD38C102D88";
        const data = await axios.get(`${api}/getAddressInfo/${address}?apiKey=${ethplorer_api_key}`);
        balances["ETH"] = { balance: data.data.ETH.balance };
        data.data.tokens.map(o => {
            if (eth_assets.indexOf(o.tokenInfo.symbol) + 1 && o.balance > 0) {
                balances[o.tokenInfo.symbol] = {
                    balance: (o.balance / (10 ** o.tokenInfo.decimals)),
                    decimals: o.tokenInfo.decimals,
                    isERC20: true,
                    "ofBase": "ETH",
                }
            }
        })
    }    
}