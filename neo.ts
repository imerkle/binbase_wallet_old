import Neon, { rpc, api, sc, u, wallet } from '@cityofzion/neon-js'
import {
    getConfig,
} from 'app/constants'
import axios from 'axios';


//@ts-ignore
Array.prototype.flatMap = function (lambda) {
    return Array.prototype.concat.apply([], this.map(lambda));
};

type NetworkType = string
type SymbolType = string

type SendEntryType = {
    amount: string,
    address: string,
    symbol: SymbolType
}
type TokenBalanceType = {
    symbol: SymbolType,
    balance: string,
    scriptHash: string,
    totalSupply: number,
    decimals: number,
    name: string
}

const isToken = (symbol: SymbolType) => !["NEO", "GAS"].includes(symbol)

const extractTokens = (sendEntries: Array<SendEntryType>) => {
    return sendEntries.filter(({ symbol }) => isToken(symbol))
}


const extractAssets = (sendEntries: Array<SendEntryType>) => {
    return sendEntries.filter(({ symbol }) => !isToken(symbol))
}


const buildIntents = (sendEntries: Array<SendEntryType>) => {
    const assetEntries = extractAssets(sendEntries)
    //@ts-ignore
    return assetEntries.flatMap(({ address, amount, symbol }) =>
        api.makeIntent(
            {
                [symbol]: amount
            },
            address
        )
    )
}


const buildTransferScript = (
    net: NetworkType,
    sendEntries: Array<SendEntryType>,
    fromAddress: string,
    tokensBalanceMap: {
        [key: string]: TokenBalanceType
    }
) => {
    const tokenEntries = extractTokens(sendEntries)
    const fromAcct = new wallet.Account(fromAddress)
    const scriptBuilder = new sc.ScriptBuilder()


    tokenEntries.forEach(({ address, amount, symbol }) => {
        const toAcct = new wallet.Account(address)
        const { scriptHash, decimals } = tokensBalanceMap[symbol]
        const args = [
            u.reverseHex(fromAcct.scriptHash),
            u.reverseHex(toAcct.scriptHash),
            sc.ContractParam.byteArray(amount, 'fixed8', decimals)
        ]


        scriptBuilder.emitAppCall(scriptHash, 'transfer', args)
    })


    return scriptBuilder.str
}


const makeRequest = (sendEntries: Array<SendEntryType>, config: any) => {
    const script = buildTransferScript(
        config.net,
        sendEntries,
        config.address,
        config.tokensBalanceMap
    )
    const intents = buildIntents(sendEntries);
    if (script === '') {
        return api.sendAsset({ ...config, intents })
    } else {
        return api.doInvoke({
            ...config,
            intents,
            script,
            gas: 0
        })
    }
}


export const sendTransaction = async (sendEntries: Array<SendEntryType>, opts) => {
    const wif = opts.wif;
    const fromAddress = opts.address
    const publicKey = opts.publicKey

    const net = new rpc.Network({
        name: 'Net',
        extra: {
            neoscan: `${opts.config[opts.base].explorer}/api/main_net`
        }
    })
    Neon.add.network(net)
    const netNeoscan = new api.neoscan.instance("Net");

    return new Promise(async(resolve, reject) => {
        try {
            const { response } = await makeRequest(sendEntries, {
                net,
                tokensBalanceMap: opts.balances,
                address: fromAddress,
                publicKey,
                fees: opts.fees,
                account: new wallet.Account(wif),
                privateKey: new wallet.Account(wif).privateKey,
                signingFunction: null,
                api: netNeoscan,
            })
            if (!response.result) {
                reject("Failed")
            }
            resolve(response)
        } catch (err) {
            reject(err)
        }
    })    
}

export const send = ({
    base, from, rel, address, amount, wif, options
}) => {
    return new Promise(async (resolve, reject) => {
    const api = getConfig(options.config, rel, base).api;

    const balance = (await axios.get(`${api}/get_balance/${address}`)).data;
    try {
        const result = await sendTransaction([{ amount, address, symbol: rel }],
            {
                balances: balance,
                wif,
                address: from,
                publicKey: options.publicKey,
                fees: options.fees,
                base
            });
            //@ts-ignore
        resolve(result.txid);
    } catch (e) { reject(e); }
    })
}


export const getTxs = async ({ config, address, rel, base }) => {
    const { api } = getConfig(config, rel, base);
    const txs = [];
    const data = await axios.get(`${api}/get_address_abstracts/${address}/0`);
    
    data.data.entries.map(o => {
        const tx = {
            from: o.address_from,
            hash: o.txid,
            confirmations: null,
            value: o.amount,
            kind: o.address_from.toLowerCase() == address.toLowerCase() ? "sent" : "got",
            fee: 0,
            timestamp: o.time,
            asset: config[base].assets[o.asset] ? config[base].assets[o.asset] : null,
        };
        txs.push(tx);
    })
    return txs;
}
export const getBalance = async ({ config, address, rel, base }) => {
    const api = getConfig(config, rel, base).api;
    const balances = {};
    
    const data = await axios.get(`${api}/get_balance/${address}`);
    data.data.balance.map(o => {
        balances[o.asset] = { balance: o.amount, isNeo: true };
    });
}