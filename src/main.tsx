import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { useStrict } from 'mobx';
//import { Provider } from 'mobx-react';

import { App } from 'app';


import Storage from 'react-native-storage';

const storage = new Storage({
    // maximum capacity, default 1000
    size: 1000,

    // Use AsyncStorage for RN apps, or window.localStorage for web apps.
    // If storageBackend is not set, data will be lost after reload.
    storageBackend: window.localStorage, // for web: window.localStorage

    // expire time, default: 1 day (1000 * 3600 * 24 milliseconds).
    // can be null, which means never expire.
    defaultExpires: null,

    // cache data in the memory. default is true.
    enableCache: true,

    // if data was not found in storage or expired data was found,
    // the corresponding sync method will be invoked returning
    // the latest data.
    sync: {
        // we'll talk about the details later.
    }
});
(window as any).storage = storage;


// enable MobX strict mode
useStrict(true);

// default fixtures for TodoStore

// prepare MobX stores


// render react DOM
ReactDOM.render(
    <App />
    ,
  document.getElementById("root")
);
