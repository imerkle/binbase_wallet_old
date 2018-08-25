import { observable, action } from 'mobx';

export class LoginStore {
  @observable index = 0;
  @observable forcedAlien = false;

  @action
  handleChangeIndex = (index) => {
    this.index = index;
  };    
  @action
  force = (s = true) => {
    this.forcedAlien = s;
  };
}

export default LoginStore;
