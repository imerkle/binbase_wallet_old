import { runInAction, observable, action } from 'mobx';
import axios from 'axios';
import { allcoins } from 'app/constants';

export class PriceStore {
    @observable fiat_prices: any;
    @observable fiat = { name: "USD", symbol: "$" };

    constructor() {
        this.fiat_prices = {};
        this.syncFiatPrices();

    }
    getFiatPrice = (ticker: string) => {
        return this.fiat_prices[ticker] ? this.fiat_prices[ticker][this.fiat.name] : 0;
    }
    @action
    syncFiatPrices = async () => {
        const data = await axios.get(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${allcoins.join()}&tsyms=${this.fiat.name}`);
        runInAction(() => {
            Object.keys(data.data).map(o => {
                this.fiat_prices[o] = data.data[o];
            })
        });
    }
}

export default PriceStore;
