import { Promise } from 'bluebird';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from 'App/App';
import { HashRouter } from 'react-router-dom';

Promise.config({ cancellation: true });

ReactDOM.render(
    <HashRouter>
        <App />
    </HashRouter>,
    document.getElementById('root')
);
