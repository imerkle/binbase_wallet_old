import { observable, action, runInAction } from 'mobx';
import { setTimeout } from 'timers';
const time_ms = 2000;
export class ConfigStore {
    @observable config = {};
    
    @action
    storeConfig = () =>{
        let config = require(`app/constants/test_config`).default;
        this.config = config;
        (window as any).storage.save({
            key: 'config',
            data: config,
        });
    }
    @action
    setConfig = () => {
        setTimeout(()=>{
            (window as any).storage.load({
                key: 'config',
            }).then(res => {
                runInAction(() => {
                    this.config = res;
                });
            }).catch(err => {
                this.storeConfig();
            });
        }, time_ms)
    };
}

export default ConfigStore;
