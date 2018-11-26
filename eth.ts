import Web3 from 'web3';
var web3Options = {
    timeout: 20000, // milliseconds,
    headers: [{ name: 'Access-Control-Allow-Origin', value: '*' }]
};
import { 
    getConfig,
    getAtomicValue,
    transferABI,
    etherscan_api_key,

} from 'app/constants';
const Tx = require('ethereumjs-tx')
import axios from 'axios';

export const getWeb3 = (rpc) => {
    //@ts-ignore
    return new Web3(new Web3.providers.HttpProvider(rpc, web3Options));
}
export const sendETH = ({
    from, rel, address, amount, wif, options
}) => {
    const { rpc } = getConfig(options.config, rel, rel);
    const web3 = getWeb3(rpc)
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
                    value: web3.utils.toHex(amount * getAtomicValue(options.config, rel, rel).toString())
                }
                sendSignedWeb3(wif, txData, (err, result) => {
                    if (err) reject(err)
                    resolve(result)
                }, web3)
            })
            .catch(e => {
                reject(e)
            })
    });
}

export const sendERC20 = ({
    base, from, rel, address, amount, wif, options
}) => {
    const { rpc } = getConfig(options.config, base, base);
    const web3 = getWeb3(rpc);
    console.log(rel,base)
    return new Promise(async (resolve, reject) => {
        const asset = options.config[base].assets[rel];

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
                sendSignedWeb3(wif, txData, (err, result) => {
                    if (err) reject(err)
                    resolve(result)
                }, web3)
            })
            .catch(e => {
                reject(e)
            })     
    });
}

export const sendSignedWeb3 = (wif: string, txData: any, cb: any, web3: any) => {
    const privateKey = new Buffer(wif.substr(2), 'hex')
    const transaction = new Tx(txData)
    transaction.sign(privateKey)
    const serializedTx = transaction.serialize().toString('hex')
    web3.eth.sendSignedTransaction('0x' + serializedTx, cb)
}


export const getEthTxs = async ({ address, rel, base, config }) => {
    const { api } = getConfig(config, base, base);
    const txs = [];
    
    let isErc20 = false;
    if (rel != base) isErc20 = true;

    const data = await axios.get(`${api}/?module=account&action=${isErc20 ? "tokentx" : "txlist" }&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${etherscan_api_key}`);
    const decimals = getAtomicValue(config, base, base);
    
    data.data.result.map(o => {        
        const tx = {
            from: o.from,
            hash: o.hash,
            confirmations: o.confirmations,
            value: isErc20 ? o.value / 10 ** o.tokenDecimal : o.value / decimals,
            kind: o.from.toLowerCase() == address.toLowerCase() ? "sent" : "got",
            fee: (o.gas * o.gasPrice) / decimals,
            timestamp: o.timeStamp,
            asset: config[base].assets[o.tokenSymbol] ? config[base].assets[o.tokenSymbol] : null,
        };

        txs.push(tx);
    })
    return txs;
}

export const getBalance = async ({ config, address, rel, base }) => {
    const { rpc, api_tokens } = getConfig(config, rel, base);
    const web3 = getWeb3(rpc);

    let balances = {};
    const tokens = [];
    for (let x in config[base].assets){
        tokens.push(config[base].assets[x].hash);
    }
    const data0 = await axios.post(`${api_tokens}`,{address, tokens});
    let i = 0;
    for (let x in config[base].assets){
        const c = config[base].assets[x];
        const v = data0.data[i][c.hash];
        balances[x] = { balance: v / getAtomicValue(config, x, base) };
        i++;
    }
    balances[base] = { balance: (await web3.eth.getBalance(address)) / getAtomicValue(config, rel, base) };
    return balances;
}