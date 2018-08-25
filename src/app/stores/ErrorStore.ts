import { observable, action } from 'mobx';
export class ErrorStore {
  
  @observable public errorTitle: string = "";
  @observable public errorDescription: string = "";
  @observable public errorLabel: string = "";
  @observable public errorActive: boolean = false;
  @observable public errorIcon: boolean = false;
  @observable public errorCode: number = -1;

  
  public visibleClass;
  public inVisibleClass;
  public rootClass;
  constructor({visibleClass, inVisibleClass, rootClass}) {
    this.visibleClass = visibleClass;
    this.inVisibleClass = inVisibleClass;
    this.rootClass = rootClass;
  }
  

  @action
  setValue = (stores: object) => {
    let self = this;
    for (let key in stores) {
        self[key] = stores[key];
    }
  }

  setErrorParams = (data) => {
      this.setValue({
        errorTitle: data.t,
        errorDescription: data.d,
        errorLabel: (data.l) ? data.l : 'Close',
        errorIcon: (data.i) ? data.i : 'error_outline',
        errorActive: true
      });
      document.querySelector(`.${this.rootClass}`).classList.add(this.visibleClass);
  }

  activateError = (data) => {
    this.setValue({
      errorActive: true,
      errorCode: data.code
    });
    document.querySelector(`.${this.rootClass}`).classList.add(this.visibleClass);
  }
  
  deactivateError = () => {
    let self = this;
    let app_container = document.querySelector(`.${this.rootClass}`);
    app_container.classList.add(this.inVisibleClass);
    setTimeout(() => {
      app_container.classList.remove(this.visibleClass, this.inVisibleClass);
      self.setValue({errorActive: false,errorCode: -1});
    },1000);
  }  
}

export default ErrorStore;
