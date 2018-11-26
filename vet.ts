import axios from 'axios';
import {getConfig, getAtomicValue} from 'app/constants';
import { thorify } from "thorify";
const Web3 = require("web3");

export const getWeb3 = (rpc) => {
    return thorify(new Web3(), rpc);
}
export const getVetTxs = async ({ config, address, rel, base }) => {
    const api = getConfig(config, rel, base).api;
    const txs = [];
    
    const data = await axios.get(`${api}/transactions?address=${address}&count=10&offset=0`);
    data.data.transactions.map(o => {
        const tx = {
            from: o.origin,
            hash: o.id,
            value: o.totalValue / getAtomicValue(config, rel, base),
            kind: o.origin == address ? "sent" : "got",
            fee: 0,
            timestamp: o.timestamp,
        };
        txs.push(tx);
    })
    
    return txs;
}
/*
export const getBalance = async ({ address, rel, base }) => {
    const api = getConfig(rel, base).api;
    const balances = {};
    
    const data = await axios.get(`${api}/accounts/${address}`);
    balances["VET"] = { balance: data.data.balance / getAtomicValue("VET", base) };
    balances["VTHO"] = { balance: data.data.energy / getAtomicValue("VTHO", base) };
    
    return balances;
}
*/
export const getBalance = async ({ config, address, rel, base }) => {
    const { rpc } = getConfig(config, rel, base);
    const web3 = getWeb3(rpc);
    
    const b = await web3.eth.getBalance(address);
    const e = await web3.eth.getEnergy(address);
    let balances = {};
    
    balances[base] = { balance: b / getAtomicValue(config, rel, base) };
    balances["VTHO"] = { balance: e / getAtomicValue(config, "VTHO", base) };
    return balances;
}