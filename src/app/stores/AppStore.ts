import { observable, action } from 'mobx';

export class AppStore {
  @observable theme: number;
  @observable snackmsg = "";
  @observable snackopen:boolean = false;

  constructor(theme = 0) {
    this.theme = theme;
  }
  @action
  setTheme = (theme: number): void => {
    this.theme = theme;
  };


  @action
  snackOpen = (state) => {
    this.snackopen = state;
  };
  @action
  setSnackMsg = (msg) => {
    this.snackmsg = msg;
    this.snackOpen(true);
  };

}

export default AppStore;
