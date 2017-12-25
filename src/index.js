import React from 'react';
import {render} from 'react-dom';
import App from './App';
import AppStore from './store/appStore';

const store = new AppStore();
render(<App store={store} />,document.getElementById("app"));