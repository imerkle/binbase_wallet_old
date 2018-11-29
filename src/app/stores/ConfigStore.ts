import { observable, action, runInAction } from 'mobx';
import Storage from 'react-native-storage';

export class ConfigStore {
    @observable config = {};
    constructor(){
        this.init();
    }
    init = () => {
        const storage = new Storage({
            size: 1000,
            storageBackend: window.localStorage,
            defaultExpires: null,
            enableCache: true,
            sync: {
            }
        });
        (window as any).storage = storage;        
    }

    setMnemonic = (mnemonic) => {
        (window as any).storage.save({
            key: 'mnemonic',
            data: mnemonic,
        });
    }
    getMnemonic = async () => {
        let res;
        try {
            res = await (window as any).storage.load({
                key: 'mnemonic',
            });
        }catch(e){}
        return res;
    }
    @action
    storeConfig = () => {
        let config = require(`app/constants/test_config`).default;
        this.config = config;
        (window as any).storage.save({
            key: 'config',
            data: config,
        });
    }    
    @action
    setConfig = async () => {
        let res;
            try{
               res = await (window as any).storage.load({
                    key: 'config',
                });
                runInAction(() => {
                    this.config = res;
                });                
            }catch(e){
                this.storeConfig();
            }
    };
}

export default ConfigStore;
