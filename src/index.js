import React from 'react';
import ReactDOM from 'react-dom';
import './static/style/App.less';
import {TransProvider} from './plugins/use-i18n';
import AppRouter from './router';
import i18n from './i18n';
localStorage.removeItem('locales');

ReactDOM.render(
    <TransProvider i18n={i18n}>
        <AppRouter/>
    </TransProvider>,
    document.getElementById('root')
);
