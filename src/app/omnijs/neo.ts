import Neon, { rpc, api, sc, u, wallet } from '@cityofzion/neon-js'
import {
    neopriv_config
} from 'app/constants'

const neo_privateNet = new rpc.Network(neopriv_config)
Neon.add.network(neo_privateNet)

const mainNetNeoscan = new api.neoscan.instance("MainNet");
const privNetNeoscan = new api.neoscan.instance("PrivateNet");

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
    const net = opts.isTestnet ? "PrivateNet" : "MainNet"
    const publicKey = opts.publicKey

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
                api: opts.isTestnet ? privNetNeoscan : mainNetNeoscan,
            })
            console.log(response)
            if (!response.result) {
                reject("Failed")
            }
            resolve(response)
        } catch (err) {
            reject(err)
        }
    })    
}