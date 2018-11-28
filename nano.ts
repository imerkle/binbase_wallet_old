import {    
    getConfig,
} from 'app/constants'
import axios from 'axios';
import * as nanocurrency from 'nanocurrency';
import BigNumber from 'bignumber.js'

export const getBalance = async ({ config, address, rel, base }) => {
    const api = getConfig(config, rel, base).api;

    const data = await axios.post(`${api}`, {
        "action": "account_balance",
        "account": address,
    });
    //@ts-ignore
    const balance = nanocurrency.convert(data.data.balance, { from: 'raw', to: 'NANO' });
    //@ts-ignore
    const pending = nanocurrency.convert(data.data.pending, { from: 'raw', to: 'NANO' });
    const balances = { [rel]: { balance: +balance, pending: +pending } }
    
    return balances;
}

export const pendingSyncNano = async ({ rel, base, config, balance, pending, address, option }) => {

    //@ts-ignore
    balance = nanocurrency.convert(balance, { from: 'NANO', to: 'raw' });
    //@ts-ignore
    pending = nanocurrency.convert(pending, { from: 'NANO', to: 'raw' });

    const { api, rep } = getConfig(config, rel, base);
    if (parseFloat(pending) > 0) {
        const d1 = await axios.post(`${api}`, {
            "action": "accounts_pending",
            "accounts": [address],
            "source": "true",
        });
        const d4 = await axios.post(`${api}`, {
            "action": "account_representative",
            "account": address,
        });

        const d3 = await axios.post(`${api}`, {
            "action": "accounts_frontiers",
            "accounts": [address],
        });

        const representative = d4.data.representative || rep;
        const frontier = d3.data.frontiers[address];


        for (let x1 in d1.data.blocks[address]) {
            const o = d1.data.blocks[address][x1];
            const previous = frontier || "0000000000000000000000000000000000000000000000000000000000000000";
            const link = x1;
            const w1 = await axios.post(`${api}`, {
                "action": "work_generate",
                "hash": frontier || option.publicKey
            });
            const bal = new BigNumber(balance).plus(o.amount);
            console.log(balance, o.amount)
            console.log(bal)
            const unsigned_block = {
                link,
                previous,
                work: w1.data.work,
                balance: bal.c.join(""),
                representative,
            };
            //@ts-ignore
            const { hash, block } = nanocurrency.createBlock(option.pkey, unsigned_block);
            //@ts-ignore
            const r1 = await axios.post(`${api}`, {
                "action": "process",
                block: JSON.stringify(block),
            });
        }
    }
}