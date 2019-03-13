/* global window, parent */
/* eslint no-restricted-globals: ["off", "parent"] */

(function(window) {
	var FUNCTION = 'function';
	var UNDEFINED = 'undefined';
	var subscribers = [];
	var promises = {};
	var method_counter = 0;
	var isWeb = typeof window !== UNDEFINED && !window.AndroidBridge && !window.webkit;
	var eventType = isWeb ? 'message' : 'VKWebAppEvent';
  
	if (typeof window !== UNDEFINED) {
  
	  //polyfill
	  if (!window.CustomEvent) {
		(function() {
		  function CustomEvent(event, params) {
			params = params || {bubbles: false, cancelable: false, detail: undefined};
			var evt = document.createEvent('CustomEvent');
			evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
			return evt;
		  };
  
		  CustomEvent.prototype = window.Event.prototype;
  
		  window.CustomEvent = CustomEvent;
		})();
	  }
  
		window.addEventListener(eventType, function() {
			var args = Array.prototype.slice.call(arguments)[0];
			var promise = null;
			var reponse = {};
			if (isWeb) {
				if (args.data && args.data.data) {
					reponse = { ...args.data };
					promise = promises[reponse.data.request_id];
				}
			} else if (args.detail && args.detail.data) {
				reponse = { ...args.detail };
				promise = promises[reponse.data.request_id];
			}
			if (reponse.data && reponse.data.request_id) {
				promise = promises[reponse.data.request_id];
				if (promise) {
					if (promise.customRequestId) {
						delete reponse.data['request_id'];
					}
					if (reponse['error_type']) {
						promise.reject(reponse);
					} else {
						promise.resolve(reponse);
					}
				}
			}
		});
	}
  
	module.exports = {
	  /**
	   * Sends a message to native client
	   *
	   *
	   * @param {String} handler Message type
	   * @param {Object} params Message data
	   * @returns {void}
	   */
	  send: function send(handler, params) {
		if (!params) {
		  params = {};
		}
  
		var isClient = typeof window !== UNDEFINED;
		var androidBridge = isClient && window.AndroidBridge;
		var iosBridge = isClient && window.webkit && window.webkit.messageHandlers;
		var isDesktop = !androidBridge && !iosBridge;
		var id = params['request_id'] ? params['request_id'] : `method#${method_counter++}`;
		var customRequestId = false;
		if (!params.hasOwnProperty('request_id')) {
		  customRequestId = true;
		  params['request_id'] = id;
		}
  
		if (androidBridge && typeof androidBridge[handler] == FUNCTION) {
		  androidBridge[handler](JSON.stringify(params));
		}
		if (iosBridge && iosBridge[handler] && typeof iosBridge[handler].postMessage == FUNCTION) {
		  iosBridge[handler].postMessage(params);
		}
  
		if (isDesktop) {
		  parent.postMessage({
			handler,
			params,
			type: 'vk-connect'
		  }, '*');
		}
  
		return new Promise((resolve, reject) => {
		  promises[id] = {
			resolve,
			reject,
			params,
			customRequestId,
		  }
		});
	  },
  
	  /**
	   * Checks if native client supports nandler
	   *
	   * @param {String} handler Handler name
	   * @returns {boolean}
	   */
	  supports: function supports(handler) {
  
		var isClient = typeof window !== UNDEFINED;
		var androidBridge = isClient && window.AndroidBridge;
		var iosBridge = isClient && window.webkit && window.webkit.messageHandlers;
  
		if (androidBridge && typeof androidBridge[handler] == FUNCTION) return true;
  
		if (iosBridge && iosBridge[handler] && typeof iosBridge[handler].postMessage == FUNCTION) return true;
  
		if (iosBridge && iosBridge[handler] && typeof iosBridge[handler].postMessage == FUNCTION) {
		  console.warn('Currently "supports" method is available only on Adnroid and iOS platforms');
		  return false;
		}
  
		return false;
	  }
	};
  })(window);
  