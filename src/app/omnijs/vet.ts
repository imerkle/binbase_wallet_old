import axios from 'axios';
import {getConfig, getAtomicValue} from 'app/constants';

export const getVetTxs = async ({ address, rel, base }) => {
    const api = getConfig(rel, base).api;
    const txs = [];
    
    const data = await axios.get(`${api}/transactions?address=${address}&count=10&offset=0`);
    data.data.transactions.map(o => {
        const tx = {
            from: o.origin,
            hash: o.id,
            value: o.totalValue / getAtomicValue(rel, base),
            kind: o.origin == address ? "sent" : "got",
            fee: 0,
            timestamp: o.timestamp,
        };
        txs.push(tx);
    })
    
    return txs;
}
export const getBalance = async ({ address, rel, base }) => {
    const api = getConfig(rel, base).api;
    const balances = {};
    
    const data = await axios.get(`${api}/accounts/${address}`);
    balances["VET"] = { balance: data.data.balance / getAtomicValue("VET", base) };
    balances["VTHO"] = { balance: data.data.energy / getAtomicValue("VTHO", base) };
    
    return balances;
}