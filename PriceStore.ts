import { runInAction, observable, action } from 'mobx';
import axios from 'axios';
//@ts-ignore
export class PriceStore {
    @observable fiat_prices: any;
    @observable fiat = { name: "USD", symbol: "$" };
    
    public configStore;
    constructor(configStore) {
        this.fiat_prices = {};
        this.configStore = configStore;
    }
    getFiatPrice = (ticker: string) => {
        return this.fiat_prices[ticker] ? this.fiat_prices[ticker][this.fiat.name] : 0;
    }
    @action
    syncFiatPrices = async () => {
        let allcoins = [];
        for(let x in this.configStore.config){
            allcoins.push(x);
            if(this.configStore.config.assets){
                allcoins = allcoins.concat(Object.keys(this.configStore.config.assets));
            }
        }

        const data = await axios.get(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${([].concat.apply([], [allcoins])).join()}&tsyms=${this.fiat.name}`);
        runInAction(() => {
            Object.keys(data.data).map(o => {
                this.fiat_prices[o] = data.data[o];
            })
        });
    }
}

export default PriceStore;
