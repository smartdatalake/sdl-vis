import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, Store } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import './index.scss';
import { IApplicationState, rootReducer } from 'redux-types';
import * as serviceWorker from './serviceWorker';
import Dashboard from './components/Dashboard';

// Init redux store
const store = ((): Store<IApplicationState> => {
    // create the composing function for our middlewares
    const composeEnhancers = composeWithDevTools({});
    return createStore(rootReducer, composeEnhancers());
})();

ReactDOM.render(<Dashboard store={store} />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
