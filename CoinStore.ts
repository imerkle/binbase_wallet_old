import { runInAction, observable, action } from 'mobx';
import OmniJs from "app/omnijs";

export class CoinStore {
    @observable keys: any;
    @observable balances: any;
    @observable mnemonic: string;
    @observable passphrase: string;

    public configStore;
    constructor(configStore) {
        this.configStore = configStore;
        
        this.keys = {};
        this.balances = {};
        this.mnemonic = "connect ritual news sand rapid scale behind swamp damp brief explain ankle";
        this.passphrase = "";

        this.generateKeys();
    }

    @action
    generateKeys = () => {
        for (let o in this.configStore.config){
            const c = this.configStore.config[o];
            const omni = new OmniJs(o, c.base ? o : c.ofBase);
            
            const k = omni.generateSeed(this.mnemonic, this.passphrase, { config: this.configStore.config })
            
            this.keys[o] = k;
            this.mnemonic = k.mnemonic;
        }
        this.syncBalances();
    }
    @action
    syncBalances = () => {
        Object.keys(this.configStore.config).map(async o=>{
            const c = this.configStore.config[o];
            const omni = new OmniJs(o, c.base ? o : c.ofBase);

            const balances = await omni.getBalance(this.keys[o].address, this.configStore.config);
            runInAction(() => {
                Object.keys(balances).map(o=>{
                    this.balances[o] = balances[o];
                })
            });            
        })
    }
}

export default CoinStore;
