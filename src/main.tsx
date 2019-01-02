import { useStrict } from "mobx";
import * as React from "react";
import * as ReactDOM from "react-dom";
// import { Provider } from 'mobx-react';

import { App } from "app";

// enable MobX strict mode
useStrict(true);

// render react DOM
ReactDOM.render(
    <App />
    ,
  document.getElementById("root"),
);
