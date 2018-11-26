import { observable, action, runInAction } from 'mobx';
import { config_file } from 'app/constants';
import { setTimeout } from 'timers';
const time_ms = 5000;
export class ConfigStore {
    @observable config = {};
    
    @action
    storeConfig = () =>{
        (window as any).storage.save({
            key: 'config',
            data: require(`app/constants/${config_file}`).default,
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
