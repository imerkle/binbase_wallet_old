import { History } from 'history';
import { RouterStore } from './RouterStore';
import { AppStore } from './AppStore';
import { LangStore } from './LangStore';
import { LoginStore } from './LoginStore';
import { XhrStore } from './XhrStore';
import { ExchangeStore } from './ExchangeStore';

export function createStores(history: History) {
  const routerStore = new RouterStore(history);
  const appStore = new AppStore();
  const langStore = new LangStore();
  const loginStore = new LoginStore();
  const xhrStore = new XhrStore();
  const exchangeStore = new ExchangeStore();
  return {
    routerStore,
    appStore,
    langStore,
    loginStore,
    xhrStore,
    exchangeStore,
  };
}
