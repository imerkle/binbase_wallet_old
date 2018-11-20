import axios from `axios`;
import { getAtomicValue } from `app/constants`;

export const getBalance = async ({address, rel, base}) => {
    const { api, node } = getConfig(rel, base);
    const balances = {};
    const data = await axios.get(`${api}/account_info/?node=${node}&address=${address}`);
    if (data.data.account_data){
        balances[rel] = { balance: data.data.account_data.Balance / getAtomicValue(rel, base) }
    }

    
}