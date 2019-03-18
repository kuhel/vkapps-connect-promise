import 'core-js/es6/map';
import 'core-js/es6/set';
import React from 'react';
import ReactDOM from 'react-dom';
// import * as VKConnect from '@vkontakte/vkui-connect';
// import VKConnect from './vkui-connect/promise';
import VKConnect from 'vkui-connect-promise';
import App from './App';

VKConnect.send('VKWebAppInit')
	.then((data) => {
		console.log(data);
		let type = data.type;
		if (['VKWebAppUpdateInfo', 'VKWebAppUpdateInsets', 'VKWebAppUpdateConfig'].indexOf(type) === -1) {
			document.getElementById('response').value = JSON.stringify(data);
		}
	})
	.catch((data) => {
		console.log(data);
		let type = data.type;
		if (['VKWebAppUpdateInfo', 'VKWebAppUpdateInsets', 'VKWebAppUpdateConfig'].indexOf(type) === -1) {
			document.getElementById('response').value = JSON.stringify(data);
		}
	});

ReactDOM.render(<App/>, document.getElementById('root'));
