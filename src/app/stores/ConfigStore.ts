import { action, observable, runInAction } from "mobx";
import Storage from "react-native-storage";

export class ConfigStore {
    @observable public config = {};
    constructor() {
        this.init();
    }
    public init = () => {
        const storage = new Storage({
            size: 1000,
            storageBackend: window.localStorage,
            defaultExpires: null,
            enableCache: true,
            sync: {
            },
        });
        (window as any).storage = storage;
    }

    public setKey = async (key, data) => {
        await (window as any).storage.save({
            key,
            data,
        });
    }
    public getKey = async (key) => {
        let res;
        try {
            res = await (window as any).storage.load({
                key,
            });
        } catch (e) {
            throw e;
        }
        return res;
    }
    @action
    public storeConfig = () => {
        const config = require(`app/constants/test_config`).default;
        this.config = config;
        this.setKey("config", config);
    }
    @action
    public setConfig = async () => {
        let res;
        try {
               res = await this.getKey("config");
               runInAction(() => {
                    this.config = res;
                });
            } catch (e) {
                this.storeConfig();
            }
    }
}

export default ConfigStore;
