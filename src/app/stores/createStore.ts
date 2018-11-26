import { History } from 'history';
import { RouterStore } from './RouterStore';
import { AppStore } from './shared_stores/AppStore';
import { ExchangeStore } from './shared_stores/ExchangeStore';
import { PriceStore } from './shared_stores/PriceStore';
import { CoinStore } from './shared_stores/CoinStore';
import { ConfigStore } from './ConfigStore';

export function createStores(history: History) {
  const routerStore = new RouterStore(history);
  const configStore = new ConfigStore();

  const appStore = new AppStore();
  const coinStore = new CoinStore(configStore);
  const exchangeStore = new ExchangeStore(coinStore, configStore);
  const priceStore = new PriceStore(configStore);

  return {
    routerStore,
    appStore,
    exchangeStore,
    priceStore,
    coinStore,
    configStore,
  };
}
