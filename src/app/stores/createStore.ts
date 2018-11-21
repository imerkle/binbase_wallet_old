import { History } from 'history';
import { RouterStore } from './RouterStore';
import { AppStore } from './AppStore';
import { LangStore } from './LangStore';
import { LoginStore } from './LoginStore';
import { ExchangeStore } from './ExchangeStore';
import { PriceStore } from './PriceStore';
import { CoinStore } from './CoinStore';

export function createStores(history: History) {
  const routerStore = new RouterStore(history);
  const appStore = new AppStore();
  const langStore = new LangStore();
  const loginStore = new LoginStore();
  const coinStore = new CoinStore();
  const exchangeStore = new ExchangeStore(coinStore);
  const priceStore = new PriceStore();

  return {
    routerStore,
    appStore,
    langStore,
    loginStore,
    exchangeStore,
    priceStore,
    coinStore,
  };
}
