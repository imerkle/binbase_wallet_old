import { runInAction, observable, action } from 'mobx';
import { config } from 'app/constants';
import OmniJs from "app/omnijs";

export class CoinStore {
    @observable keys: any;
    @observable balances: any;
    @observable mnemonic: string;
    @observable passphrase: string;

    constructor() {
        this.keys = {};
        this.balances = {};
        this.mnemonic = "connect ritual news sand rapid scale behind swamp damp brief explain ankle";
        this.passphrase = "";

        this.generateKeys();
    }

    @action
    generateKeys = () => {
        for(let o in config){
            const c = config[o];
            const omni = new OmniJs(o, c.base ? o : c.ofBase);
            
            const k = omni.generateSeed(this.mnemonic, this.passphrase)
            
            this.keys[o] = k;
            this.mnemonic = k.mnemonic;
        }
        this.syncBalances();
    }
    @action
    syncBalances = () => {
        Object.keys(config).map(async o=>{
            const c = config[o];
            const omni = new OmniJs(o, c.base ? o : c.ofBase);

            const balances = await omni.getBalance(this.keys[o].address);
            runInAction(() => {
                Object.keys(balances).map(o=>{
                    this.balances[o] = balances[o];
                })
            });            
        })
    }
}

export default CoinStore;
