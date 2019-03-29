import 'core-js/es6/map';
import 'core-js/es6/set';
import React from 'react';
import ReactDOM from 'react-dom';
import VKConnect from '@vkontakte/vkui-connect-promise';
import App from './App';

VKConnect.send('VKWebAppInit')
	.then((data) => {
		console.log(data);
	})
	.catch((data) => {
		console.log(data);
	});

ReactDOM.render(<App/>, document.getElementById('root'));
