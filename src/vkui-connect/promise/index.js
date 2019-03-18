import '@babel/polyfill';

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

if (!window.CustomEvent) {
  (function () {
    function CustomEvent(event, params) {
      params = params || {
        bubbles: false,
        cancelable: false,
        detail: undefined
      };
      var evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
      return evt;
    }
    CustomEvent.prototype = window.Event.prototype;
    window.CustomEvent = CustomEvent;
  })();
}

/* global window, parent */

/* eslint no-restricted-globals: ["off", "parent"] */

var FUNCTION = 'function';
var UNDEFINED = 'undefined';
var isWeb = typeof window !== UNDEFINED && !window.AndroidBridge && !window.webkit;
var eventType = isWeb ? 'message' : 'VKWebAppEvent';
var promises = {};
var method_counter = 0;

function Defer() {
  var res = null;
  var rej = null;
  var promise = new Promise(function (resolve, reject) {
    res = resolve;
    rej = reject;
  });
  promise.resolve = res;
  promise.reject = rej;
  return promise;
}

function DeferFabrika(params, id, customRequestId) {
  var promise = new Defer();
  promises[id] = {
    defer: promise,
    params: params,
    customRequestId: customRequestId
  };
  return promise;
}

window.addEventListener(eventType, function (event) {
  var promise = null;
  var reponse = {};

  if (isWeb) {
    if (event.data && event.data.data) {
      reponse = _extends({}, event.data);
      promise = promises[reponse.data.request_id];
    }
  } else if (event.detail && event.detail.data) {
    reponse = _extends({}, event.detail);
    promise = promises[reponse.data.request_id];
  }

  if (reponse.data && reponse.data.request_id) {
    promise = promises[reponse.data.request_id];

    if (promise) {
      if (promise.customRequestId) {
        delete reponse.data['request_id'];
      }
      /* eslint no-console: "off" */


      console.log(promise);

      if (reponse.data['error_type']) {
        promise.defer.reject(reponse);
      } else {
        promise.defer.resolve(reponse);
      }
    }
  }
});
var index = {
  /**
   * Sends a message to native client
   *
   *
   * @param {String} handler Message type
   * @param {Object} params Message data
   * @returns {Promise}
   */
  send: function send(handler, params) {
    if (!params) {
      params = {};
    }

    var isClient = typeof window !== UNDEFINED;
    var androidBridge = isClient && window.AndroidBridge;
    var iosBridge = isClient && window.webkit && window.webkit.messageHandlers;
    var isDesktop = !androidBridge && !iosBridge;
    var id = params['request_id'] ? params['request_id'] : "method#" + method_counter++;
    var customRequestId = false;

    if (!params.hasOwnProperty('request_id')) {
      customRequestId = true;
      params['request_id'] = id;
    }

    if (androidBridge && typeof androidBridge[handler] === FUNCTION) {
      androidBridge[handler](JSON.stringify(params));
    }

    if (iosBridge && iosBridge[handler] && typeof iosBridge[handler].postMessage === FUNCTION) {
      iosBridge[handler].postMessage(params);
    }

    if (isDesktop) {
      parent.postMessage({
        handler: handler,
        params: params,
        type: 'vk-connect'
      }, '*');
    }

    return new DeferFabrika(params, id, customRequestId);
  }
};

export default index;
