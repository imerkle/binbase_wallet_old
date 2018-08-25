import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { useStrict } from 'mobx';
//import { Provider } from 'mobx-react';

import { App } from 'app';

// enable MobX strict mode
useStrict(true);

// default fixtures for TodoStore

// prepare MobX stores


// render react DOM
ReactDOM.render(
    <App />
    ,
  document.body
);
