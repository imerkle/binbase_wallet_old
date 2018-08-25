import { observable } from 'mobx';
import axios from 'axios';
const SERVER_URL = 'http://0.0.0.0:4000/api';

export class XhrStore {
  @observable public axios;
  
  constructor() {
	//this.axios = axios;
  }

  get = ({ errorStore, langStore }, url, callback=()=>{},doResolve = true) => {
	  return new Promise((resolve, reject) => {
	    axios.get(SERVER_URL + url)
	    .then(response => {
	      if(doResolve){
	        resolve();

	        if(response.data.err_code !== undefined){
          		//displayError(errorStore, langStore, response.data.err_code);
          		let code = response.data.err_code;
          		errorStore.setErrorParams(langStore.getE(code));
				errorStore.activateError({code : code})
          		return false;
	        }

	        //@ts-ignore
	        callback(response.data);
	      }else{

	        if(response.data.err_code !== undefined){
          		//displayError(errorStore, langStore, response.data.err_code);
          		let code = response.data.err_code;
          		errorStore.setErrorParams(langStore.getE(code));
				errorStore.activateError({code : code})
          		return false;
	        }

	      	//@ts-ignore
	        callback(response.data, resolve);
	      }
	    })
	    .catch( (err) => {
          		let code = 0;
          		errorStore.setErrorParams(langStore.getE(code));
				errorStore.activateError({code : code})
	          resolve();
	      });
	  });
  }
post = ({ errorStore, langStore }, url, params, callback=()=>{},doResolve = true) => {
	  return new Promise((resolve, reject) => {
	    axios.post(SERVER_URL + url, params)
	    .then(response => {
	      if(doResolve){
	        resolve();

	        if(response.data.err_code !== undefined){
          		//displayError(errorStore, langStore, response.data.err_code);
          		let code = response.data.err_code;
          		errorStore.setErrorParams(langStore.getE(code));
				errorStore.activateError({code : code})
          		return false;
	        }

	        //@ts-ignore
	        callback(response.data);
	      }else{

	        if(response.data.err_code !== undefined){
          		//displayError(errorStore, langStore, response.data.err_code);
          		let code = response.data.err_code;
          		errorStore.setErrorParams(langStore.getE(code));
				errorStore.activateError({code : code})
          		return false;
	        }

	      	//@ts-ignore
	        callback(response.data, resolve);
	      }
	    })
	    .catch( (err) => {
          		let code = 0;
          		errorStore.setErrorParams(langStore.getE(code));
				errorStore.activateError({code : code})
	          resolve();
	      });
	  });
  }
}

export default XhrStore;
