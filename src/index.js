import 'core-js/es6/map';
import 'core-js/es6/set';
import React from 'react';
import ReactDOM from 'react-dom';
// import * as VKConnect from '@vkontakte/vkui-connect';
import VKConnect from './vkui-connect/promise';
// import VKConnect from 'vkui-connect-promise';
import App from './App';

VKConnect.send('VKWebAppInit');

ReactDOM.render(<App/>, document.getElementById('root'));
