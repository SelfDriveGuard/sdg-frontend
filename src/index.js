import React from 'react';
import ReactDOM from 'react-dom';
import './static/style/App.less';
import AppRouter from './router'
ReactDOM.render(
    <AppRouter/>,
    document.getElementById('root')
);
